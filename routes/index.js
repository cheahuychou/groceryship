// Author: Cheahuychou Mao

var express = require('express');
var router = express.Router();
var request = require('request');
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var csrf = require('csurf');
var qs = require('querystring');
var utils = require('../javascripts/utils.js');
var authentication = require('../javascripts/authentication.js');
var config = require('../javascripts/config.js');
var User = require('../models/user');

// stripe keys
var CLIENT_ID = process.env.STRIPE_CLIENT_ID || config.stripeClientId();
var API_KEY = process.env.STRIPE_API_KEY || config.stripeApiKey();
var stripe = require("stripe")(API_KEY);
var TOKEN_URI = process.env.STRIPE_TOKEN_URI || config.stripeTokenURI();
var AUTHORIZE_URI = process.env.STRIPE_AUTHORIZE_URI || config.stripeAuthorizeURI();

// setup csurf middlewares 
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.passport && req.session.passport.user && req.session.passport.user.username) {
        res.redirect('/deliveries/username/'+ req.session.passport.user.username);
    } else {
        res.render('home', {title: 'GroceryShip',
                            allDorms: utils.allDorms(),
                            csrfToken: req.csrfToken()});
    }
});

// Use passport.js for login authentication and bcrypt to encrypt passwords
passport.use(new LocalStrategy(function (username, password, callback) {
    User.authenticate(username.toLowerCase(), password, callback);
}))

passport.serializeUser(function (user, callback) {
    callback(null, user);
})

passport.deserializeUser(function (user, callback) {
    User.find({username: user.username}, function(err, user) {
        callback(err, user);
    });
});

// Logs the user in
router.post('/login', parseForm, csrfProtection, function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        data = {title: 'GroceryShip',
                allDorms: utils.allDorms(),
                csrfToken: req.csrfToken()};
        if (err) {
            data.message = err.message;
            return res.render('home', data);
        }
        if (!user) {
            return res.redirect('/');
        } 
        if (!user.verified) {
            data.message = 'Your account has not been verified, please go to your mailbox to verify.';
            data.isValidAccount = true;
            data.username = user.username;
            return res.render('home', data);
        }
        req.logIn(user, function(err) {
            if (err) {
                data.message = err.message;
                return res.render('home', data);
            }
            req.fullName = user.fullName;
            res.redirect('/deliveries/username/'+ user.username);
        });
    })(req, res, next);
});

// Logs the user out
router.post('/logout', parseForm, csrfProtection, function(req, res, next) {
    req.logout();
    res.redirect('/');
});

// Resends verification email
router.get('/verify/:username/resend', function(req, res, next) {
    var username = req.params.username
    data = {title: 'GroceryShip',
            username: username,
            allDorms: utils.allDorms(),
            csrfToken: req.csrfToken()}
    User.sendVerficationEmail(username, req.devMode, function (err, user) {
        if (err) {
            return res.render('home', data);
        }
        data.message = 'We have sent another verification email. Please check your MIT email.';
        res.render('home', data);
    });    
});

// Directs user to verification page
router.get('/verify/:username/:verificationToken', function(req, res, next) {
    data = {title: 'GroceryShip',
            username: req.params.username,
            verificationToken: req.params.verificationToken,
            allDorms: utils.allDorms(),
            csrfToken: req.csrfToken()}
    res.render('home', data);      
});

// Verifies the account
router.put('/verify/:username/:verificationToken', parseForm, csrfProtection, function(req, res, next) {
    User.verifyAccount(req.params.username, req.params.verificationToken, function (err, user) {
        data = {title: 'GroceryShip',
                allDorms: utils.allDorms(),
                csrfToken: req.csrfToken()}
        if (err && !err.isVerified) {
            data.message = err.message;
            return res.json({'success': false, message: err.message});
        }
        data.message = 'Your account has been verified. You can now log in';
        data.success = true;
        data.redirect = '/'
        res.json(data);
    })
});

// Signs up a new account
router.post('/signup', parseForm, csrfProtection, function(req, res, next) {
    var username = req.body.requestedKerberos.trim().toLowerCase();
    var password = req.body.requestedPassword.trim();
    var phoneNumber = parseInt(req.body.requestedPhoneNumber.trim());
    var dorm = req.body.dorm.trim();

    data = {title: 'GroceryShip',
            allDorms: utils.allDorms(),
            csrfToken: req.csrfToken()}

    if (username.length == 0 || password.length == 0) {
        data.message = 'Please enter your kerberos and password below';
        res.render('home', data);
    } else {
        // validate kerberos both in production and development mode
        authentication.getMitInfo(username, function(mitData) {
            // still proceed regardless when in development
            if (req.devMode || mitData.isValidKerberos) {
                User.count({ username: username },
                    function (err, count) {
                        if (count > 0) {
                            data.message = 'There is already an account with this kerberos, '
                                            + 'make sure you enter your kerberos correctly';
                            res.render('home', data);
                        } else {
                            authentication.createUserJSON(username, password, phoneNumber, dorm, mitData,
                                function (err, userJSON) {
                                    if (err) {
                                        data.message = err.message;
                                        res.render('home', data);
                                    }
                                    if (req.devMode){
                                        res.redirect(AUTHORIZE_URI + '?' + 
                                             qs.stringify({ response_type: 'code',     
                                                            scope: 'read_write',
                                                            client_id: CLIENT_ID,
                                                            state: JSON.stringify(userJSON)
                                        }));
                                    } else {
                                        res.redirect(AUTHORIZE_URI + '?' + 
                                             qs.stringify({ response_type: 'code',
                                                            redirect_uri: 'https://groceryship.herokuapp.com/oauth/callback',
                                                            scope: 'read_write',
                                                            client_id: CLIENT_ID,
                                                            state: JSON.stringify(userJSON)
                                        }));
                                    }
                            });
                        };
                });
            } else if (!mitData.success) {
                data.message = 'Sorry, we aren\'t able to verify your kerberos at the moment.'
                                + 'Please try again.';
                res.render('home', data);
            } else {
                data.message = 'Your kerberos isn\'t valid. You need a valid MIT kerberos to sign up.';
                res.render('home', data);
            }
        });
    }
});

// Connects Stripe account to the account
router.get('/oauth/callback', function(req, res) {
    var code = req.query.code;

    //Make /oauth/token endpoint POST request
    request.post({  url: TOKEN_URI,
                    form: { grant_type: 'authorization_code',
                            client_id: CLIENT_ID,
                            code: code,
                            client_secret: API_KEY
                        }
    }, function(err, r, body) {
        if (err) {
            res.json({'success': false, 'message': err.message});
        } else {
            var user = JSON.parse(req.query.state);
            var authResponse = JSON.parse(body);
            var stripeId = authResponse.stripe_user_id;
            user['stripeId'] = stripeId;
            stripe.accounts.retrieve(stripeId,
                function(err, account){
                    if (err) {
                        res.json({'success': false, 'message': err.message});
                    } else {
                        // test accounts have no email so use a test one
                        user['stripeEmail'] = account.email ? account.email : 'testStripeEmail';
                        User.signUp(user, req.devMode, function (err, user) {
                            if (err) {
                                res.json({'success': false, 'message': err.message});
                            } else {
                                res.render('home', {title: 'GroceryShip',
                                                    message: 'Sign up successful! We have sent you a verification email.'
                                                              + 'Please check your MIT email.',
                                                    allDorms: utils.allDorms(),
                                                    csrfToken: req.csrfToken()});
                            }
                        })
                        
                    } 
                }
            );
        }
    });
});

router.get('/faq', authentication.isAuthenticated, function (req, res) {
    var user = req.session.passport.user;
    res.render('faq', { title: 'FAQ',
                        username: user.username,
                        fullName: user.fullName,
                        csrfToken: req.csrfToken()});
});

module.exports = router;

