// Author: Cheahuychou Mao

var express = require('express');
var router = express.Router();
var request = require('request');
var utils = require('../javascripts/utils.js');
var config = require('../javascripts/config.js');
var email = require('../javascripts/email.js');
var User = require('../models/user');
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var qs = require('querystring');
var CLIENT_ID = process.env.STRIPE_CLIENT_ID || config.stripeClientId();
var API_KEY = process.env.STRIPE_API_KEY || config.stripeApiKey();
var stripe = require("stripe")(API_KEY);
var TOKEN_URI = 'https://connect.stripe.com/oauth/token';
var AUTHORIZE_URI = 'https://connect.stripe.com/oauth/authorize';

/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.session.passport && req.session.passport.user && req.session.passport.user.username) {
		res.redirect('/deliveries/username/'+ req.session.passport.user.username);
	} else {
		res.render('home', { title: 'GroceryShip', allDorms: utils.allDorms()});
	}
});

// Use passport.js for login authentication and bcrypt to encrypt passwords
passport.use(new LocalStrategy(function (username, password, done) {
	username = username.toLowerCase();
	User.findOne({ username: username }, function (err, user) {
		if (err || user == null) {
			console.log(done)
			done({message:'Please enter a valid username'});
		} else {
			bcrypt.compare(password, user.password, function (err, response) {
        if (response == true) {
          	done(null, {username: username, _id: user._id, verified: user.verified});
        } else {
          	done({message:'Please enter a correct password'});
        }
      });
		}
	}); 
}))

passport.serializeUser(function (user, done) {
	done(null, user);
})

passport.deserializeUser(function (user, done) {
	User.find({username: user.username}, function(err, user) {
  	done(err, user);
	});
});


router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
    	return res.render('home', { title: 'GroceryShip', message: err.message, allDorms: utils.allDorms()});
    }
    if (!user) {
    	return res.redirect('/');
    } 
    if (!user.verified) {
    	return res.render('home', { title: 'GroceryShip', message: 'Your account has not been verified, please go to your mailbox to verify.', allDorms: utils.allDorms()});
    }

    req.logIn(user, function(err) {
      if (err) { return res.render('home', { title: 'GroceryShip', message: err.message, allDorms: utils.allDorms()}); }
      res.redirect('/deliveries/username/'+ user.username);
    });
  })(req, res, next);
});

router.post('/logout', function(req, res, next) {
	req.logout();
	res.redirect('/');
});

router.get('/verify/:username/:verificationToken', function(req, res, next) {
	User.verifyAccount(req.params.username, req.params.verificationToken, function (err, user) {
		if (err) {
			return res.render('home', { title: 'GroceryShip', message: err.message, allDorms: utils.allDorms()});
		}
		return res.render('home', { title: 'GroceryShip', message: 'Your account has been verified. Now log in below:', allDorms: utils.allDorms()});
	})
});

router.post('/signup', function(req, res, next) {
	var requestedUsername = req.body.requestedKerberos.trim().toLowerCase();
	var requestedPassword = req.body.requestedPassword.trim();
	var requestedMitId = parseInt(req.body.requestedMitId.trim());
	var requestedPhoneNumber = parseInt(req.body.requestedPhoneNumber.trim());
	var dorm = req.body.dorm.trim();

	if (requestedUsername.length == 0 || requestedPassword.length == 0) {
		res.render('home', { title: 'GroceryShip', message: 'Please enter your kerberos and password below', allDorms: utils.allDorms()});
	} else {
		User.count({ username: requestedUsername },
			function (err, count) {
				if (count > 0) {
					res.render('home', { title: 'GroceryShip', message: 'There is already an account with this kerberos, make sure you enter your kerberos correctly', allDorms: utils.allDorms()});
				} else {
					User.count({ mitId: requestedMitId },
						function (err, count) {
							if (count > 0) {
								res.render('home', { title: 'GroceryShip', message: 'There is already an account with this MIT ID, make sure you enter your MIT ID correctly', allDorms: utils.allDorms()});
							} else {
								bcrypt.genSalt(function(err, salt) {
					   				if (err) {
					   					return next(err);
					   				} else {
					   					bcrypt.hash(requestedPassword, salt, function(err, hash) {
					     					if (err) {
					     						return next(err);
					     					} else {
					     						var user = { username: requestedUsername, password: hash, mitId: requestedMitId, phoneNumber: requestedPhoneNumber, dorm: dorm };
												res.redirect(AUTHORIZE_URI + '?' + qs.stringify({
												    response_type: 'code',
												    scope: 'read_write',
												    client_id: CLIENT_ID,
												    state: JSON.stringify(user)
											  	}));	
					   						};
					  				});
				  				};
				  			});
				  		};	
					});	
				};
		});
	}
});

router.get('/oauth/callback', function(req, res) {
  	var code = req.query.code;

  	//Make /oauth/token endpoint POST request
  	request.post({
		url: TOKEN_URI,
		form: {
			grant_type: 'authorization_code',
			client_id: CLIENT_ID,
			code: code,
			client_secret: API_KEY
		}
  	}, function(err, r, body) {
  		if (err) {
			res.json({
				'success': false, 
				'message': err.message
			});
  		} else {
			var user = JSON.parse(req.query.state);
			var stripeId = JSON.parse(body).stripe_user_id;
			user['stripeId'] = stripeId;
			stripe.accounts.retrieve(stripeId,
				function(err, account){
					if (err) {
						res.json({
							'success': false, 
							'message': err.message
						});
					} else {
						user['stripeEmail'] = account.email;	
						User.create(user, function(err, user_obj){
							if (err) {
								res.json({
									'success': false, 
									'message': err.message
								});
							} else {
								if (req.env === 'development') {
									email.sendVerficationEmail(user_obj, true);
								} else {
									email.sendVerficationEmail(user_obj, false);
								}
								res.render('home', { title: 'GroceryShip', message: 'Sign up successful! We have sent you a verification email. Please check your MIT email.', allDorms: utils.allDorms()});
							}
						});
					} 
				}
			);
  		}
	});
});

module.exports = router;

