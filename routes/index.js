var express = require('express');
var router = express.Router();
var utils = require('../public/javascripts/utils.js');
var User = require('../models/user');
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.session.passport && req.session.passport.user && req.session.passport.user.username) {
		res.redirect('/users/'+ req.session.passport.user.username);
	} else {
		res.render('index', { title: 'GroceryShip' });
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
          done(null, {username: username});
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
	res.redirect('/users/'+ req.user.username);	
});

router.post('/logout', function(req, res, next) {
	req.logout();
	res.redirect('/');
});

router.post('/signup', function(req, res, next) {
	var requested_username = req.body.requested_kerberos.trim().toLowerCase();
	var requested_password = req.body.requested_password.trim();
	var requested_mit_id = parseInt(req.body.requested_mit_id.trim());
	var requested_phone_number = parseInt(req.body.requested_phone_number.trim());
	var dorm = req.body.dorm.trim();
	console.log('signing up')
	console.log(requested_username, requested_password, requested_mit_id, requested_phone_number, dorm)

	if (requested_username.length == 0 || requested_password.length == 0) {
		res.render('index', { title: 'GroceryShip', message: 'Please enter your kerberos and password below'});
	} else {
		User.count({ username: requested_username },
			function (err, count) {
				if (count > 0) {
					res.render('index', { title: 'GroceryShip', message: 'There is already an account with this kerberos, make sure your enter your kerberos correctly'});
				} else {
					bcrypt.genSalt(function(err, salt) {
	   				if (err) {
	   					return next(err);
	   				} else {
	   					bcrypt.hash(requested_password, salt, function(err, hash) {
	     					if (err) {
	     						return next(err);
	     					} else {
	     						var user = { username: requested_username, password: hash, mit_id: requested_mit_id, phone_number: requested_phone_number, dorm: dorm };
									User.create(user, 
										function(err, record) {
											if (err) {
												res.json({
													'success': false, 
													'message': err.message
												});
											}
											res.render('index', { title: 'GroceryShip', message: 'You have been registered. Now please log in below:'});
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

