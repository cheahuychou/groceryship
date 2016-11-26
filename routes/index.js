var express = require('express');
var router = express.Router();
var request = require('request');
var utils = require('../public/javascripts/utils.js');
var User = require('../models/user');
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var qs = require('querystring');
var CLIENT_ID = process.env.STRIPE_CLIENT_ID;
var API_KEY = process.env.STRIPE_API_KEY;
var stripe = require("stripe")(API_KEY);
var TOKEN_URI = 'https://connect.stripe.com/oauth/token';
var AUTHORIZE_URI = 'https://connect.stripe.com/oauth/authorize';

/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.session.passport && req.session.passport.user && req.session.passport.user.username) {
		res.redirect('/deliveries/username/'+ req.session.passport.user.username);
	} else {
		res.render('home', { title: 'GroceryShip' });
	}
});

// Use passport.js for login authentication and bcrypt to encrypt passwords
passport.use(new LocalStrategy(function (username, password, done) {
	username = username.toLowerCase();
	User.findOne({ username: username }, 'password', function (err, user) {
		if (err || user == null) {
			done(new Error('Please enter a valid username'));
		} else {
			bcrypt.compare(password, user.password, function (err, response) {
        if (response == true) {
          done(null, {username: username, _id: user._id});
        } else {
          done(new Error('Please enter a correct password'));
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


router.post('/login', passport.authenticate('local', { failureRedirect: '/' }), function (req, res, next) {
	res.redirect('/deliveries/username/'+ req.user.username);
});

router.post('/logout', function(req, res, next) {
	req.logout();
	res.redirect('/');
});

router.post('/signup', function(req, res, next) {
	var requestedUsername = req.body.requestedKerberos.trim().toLowerCase();
	var requestedPassword = req.body.requestedPassword.trim();
	var requestedMitId = parseInt(req.body.requestedMitId.trim());
	var requestedPhoneNumber = parseInt(req.body.requestedPhoneNumber.trim());
	var dorm = req.body.dorm.trim();

	if (requestedUsername.length == 0 || requestedPassword.length == 0) {
		res.render('home', { title: 'GroceryShip', message: 'Please enter your kerberos and password below'});
	} else {
		User.count({ username: requestedUsername },
			function (err, count) {
				if (count > 0) {
					res.render('home', { title: 'GroceryShip', message: 'There is already an account with this kerberos, make sure you enter your kerberos correctly'});
				} else {
					User.count({ mitId: requestedMitId },
						function (err, count) {
							if (count > 0) {
								res.render('home', { title: 'GroceryShip', message: 'There is already an account with this MIT ID, make sure you enter your MIT ID correctly'});
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
												// Connect with the Stripe account.
												res.redirect(AUTHORIZE_URI + '?' + qs.stringify({
												    response_type: 'code',
												    scope: 'read_write',
												    client_id: CLIENT_ID,
												    state: JSON.stringify(user)
											  	}));					
					   						}
					  				 	});	
					  				}
				  				});
				  			}
				  		});	
					}	
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
		var user = JSON.parse(req.query.state);
		var stripeId = JSON.parse(body).stripe_user_id;
		user['stripeId'] = stripeId;
		stripe.accounts.retrieve(stripeId,
			function(err, account){
				user['stripeEmail'] = account.email;	
				User.create(user, function(err, user_obj){
					if (err) {
						res.json({
							'success': false, 
							'message': err.message
						});
					}
					res.render('home', { 
						title: 'GroceryShip', 
						message: 'You have been registered. Now please log in below:'
					});
				});    
			}
		);
		
	});
});

module.exports = router;

