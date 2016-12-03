var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var User = require('../models/user.js');
var utils = require('../javascripts/utils.js');
var authentication = require('../javascripts/authentication.js');

// setup route middlewares 
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/:username', authentication.isAuthenticated, function (req, res, next) { 
	res.render('dashboard', { title: 'Dashboard',
							  username: req.params.username,
							  fullName: user.fullName,
							  csrfToken: req.csrfToken()});
});

router.get('/:username/request', authentication.isAuthenticated, function (req, res, next) { 
	var user = req.session.passport.user;
	res.render('request', { title: 'Request for a Delivery',
		                    username: req.params.username,
		                    fullName: user.fullName,
      	                    allPickupLocations: utils.allPickupLocations(),
    	                    allStores: utils.allStores(),
    	                    csrfToken: req.csrfToken()
		                });
});

router.get('/:username/profile', authentication.isAuthenticated, function (req, res, next) {
	User.findOne({'username': req.params.username}, function(err, user){
		res.render('profile', {title: 'Profile Page',
			                   user: user,
			                   username: req.params.username,
			                   fullName: user.firstName + ' ' + user.lastName,
			                   allDorms: utils.allDorms(),
			                   csrfToken: req.csrfToken()
			               });
	});
});

router.put('/:username/profile', authentication.isAuthenticated, parseForm, csrfProtection, function(req, res, next){
	var newPassword = req.body.newPassword.trim();
	var newPhoneNumber = parseInt(req.body.newPhoneNumber.trim());
	var dorm = req.body.dorm.trim();
	console.log('yo updating');
	bcrypt.genSalt(function(err, salt) {
		if (err) {
	  		return next(err);
	  	} else {
	  		bcrypt.hash(newPassword, salt, function(err, hash) {
	  			if (err) {
	  				return next(err);
	  			} else {
	  				User.findOneAndUpdate({'username': req.params.username}, { 
							"$set": {"password": hash, "phoneNumber": newPhoneNumber, "dorm": dorm}
					}).exec(function(err, user){
						if (err) {
							return next(err);
						} else {
							res.redirect('back');
						}
					});
	  			}
	  		});
	  	}
	});
});


module.exports = router;
