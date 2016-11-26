var express = require('express');
var router = express.Router();
var utils = require('../public/javascripts/utils.js');
var config = require('../public/javascripts/config.js');
var email = require('../public/javascripts/email.js');
var User = require('../models/user');
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.session.passport && req.session.passport.user && req.session.passport.user.username) {
		res.redirect('/deliveries/'+ req.session.passport.user.username);
	} else {
		res.render('home', { title: 'GroceryShip' });
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
    	return res.render('home', { title: 'GroceryShip', message: err.message});
    }
    if (!user) {
    	return res.redirect('/');
    } 
    if (!user.verified) {
    	return res.render('home', { title: 'GroceryShip', message: 'Your account has not been verified, please go to your mailbox to verify.'});
    }

    req.logIn(user, function(err) {
      if (err) { return res.render('home', { title: 'GroceryShip', message: err.message}); }
      res.redirect('/deliveries/'+ user.username);
    });
  })(req, res, next);
});

router.post('/logout', function(req, res, next) {
	req.logout();
	res.redirect('/');
});

router.get('/verify/:username/:verificationToken', function(req, res, next) {
	User.verifyAccount(req.params.username, req.params.verificationToken, function (err, user) {
		res.render('home', { title: 'GroceryShip', message: 'Your account has been verified. Now log in below:'});
	})
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
												User.create(user, 
													function(err, user_obj) {
														if (err) {
															res.json({
																'success': false, 
																'message': err.message
															});
														} else {
															// TODO: verify that the kerberos is valid
															email.sendVerficationEmail(user_obj);
															res.render('home', { title: 'GroceryShip', message: 'We have sent you a verification email. Please check your MIT email.'});
															}
														});
												};
					   						});
					  				}
				  				});
				  			}
				  		});	
					}	
				});
		}
});

module.exports = router;

