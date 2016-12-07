var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var passport = require('passport');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var User = require('../models/user.js');
var utils = require('../javascripts/utils.js');
var authentication = require('../javascripts/authentication.js');

// setup csurf middlewares 
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/:username', authentication.isAuthenticated, function (req, res, next) { 
	res.render('dashboard', { title: 'Dashboard',
							  username: req.params.username,
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

router.put('/:username/profile/edit', authentication.isAuthenticated, parseForm, csrfProtection, function(req, res, next){
	var newPhoneNumber = parseInt(req.body.newPhoneNumber.trim());
	var newDorm = req.body.newDorm.trim();
	console.log('yo updating');
	User.editProfile(req.params.username, newPhoneNumber, newDorm, function(err){
		if (err) {
			res.json({success: false, message: err});
		} else {
			res.json({success: true});
		}
	});  			
});

router.put('/:username/changePassword', authentication.isAuthenticated, parseForm, csrfProtection, function(req, res, next){
	var currentPassword = req.body.currentPassword.trim();
	var newPassword = req.body.newPassword.trim();
	console.log('yo updating');
	User.authenticate(req.params.username, currentPassword, function(err, user){
		if (err){
			res.json({success: false, message: err.message});
		} else {
			User.changePassword(user.username, newPassword, function(err){
				if (err) {
					res.json({success: false, message: err.message});
				} else {
					res.json({success: true});
				}
			});
		}
	});			
});

module.exports = router;
