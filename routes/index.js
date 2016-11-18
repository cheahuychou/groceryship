var express = require('express');
var router = express.Router();
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// var User = require('../models/user');


/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.session.passport && req.session.passport.user && req.session.passport.user.kerberos) {
		res.redirect('/users/'+ req.session.passport.user.kerberos);
	} else {
		res.render('index', { title: 'GroceryShip' });
	}
});

// Use passport.js for login authentication and bcrypt to encrypt passwords
passport.use(new LocalStrategy(function (kerberos, password, done) {
	User.findOne({ kerberos: kerberos }, 'password', function (err, user) {
		if (err || user == null) {
			done(new Error('Please enter a valid kerberos'));
		} else {
			bcrypt.compare(password, user.password, function (err, response) {
        if (response == true) {
          done(null, {kerberos: kerberos});
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
	User.find({kerberos: user.kerberos}, function(err, user) {
  	done(err, user);
	});
});


router.post('/login', passport.authenticate('local', { failureRedirect: '/' }), function (req, res, next) {
	res.redirect('/users/'+ req.user.kerberos);	
});

router.post('/logout', function(req, res, next) {
	req.logout();
	res.redirect('/');
});

router.post('/signup', function(req, res, next) {
	var requested_kerberos = req.body.requested_kerberos.trim();
	var requested_password = req.body.requested_password.trim();

	if (requested_kerberos.length == 0 || requested_password.length == 0) {
		res.render('index', { title: 'GroceryShip', message: 'Please enter your kerberos and password below'});
	} else {
		User.count({ kerberos: requested_kerberos },
			function (err, count) {
				if (count > 0) {
					res.render('index', { title: 'GroceryShip', message: 'Please enter your kerberos'});
				} else {
					bcrypt.genSalt(function(err, salt) {
	   				if (err) {
	   					return next(err);
	   				} else {
	   					bcrypt.hash(requested_password, salt, function(err, hash) {
	     					if (err) {
	     						return next(err);
	     					} else {
	     						var user = { kerberos: requested_kerberos, password: hash };
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

