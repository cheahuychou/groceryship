var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var User = require('../models/user.js');
var utils = require('../javascripts/utils.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//TODO: remove this as I think it's no longer used?
router.get('/:username', utils.isAuthenticated, function (req, res, next) { 
	res.render('dashboard', { title: 'Dashboard', username: req.params.username});
});

router.get('/:username/request', utils.isAuthenticated, function (req, res, next) { 
	res.render('request', { title: 'Request for a Delivery',
		                    username: req.params.username,
      	                    allPickupLocations: utils.allPickupLocations(),
    	                    allStores: utils.allStores()
		                });
});

//TODO: remove this as I think it's no longer used?
router.get('/:username/deliver', utils.isAuthenticated, function (req, res, next) { 
	res.render('deliver', { title: 'Request Feed', username: req.params.username});
});

router.get('/:username/profile', utils.isAuthenticated, function (req, res, next) {
	User.findOne({'username': req.params.username}, function(err, user){
		res.render('profile', {title: 'Profile Page',
			                   user: user,
			                   username: req.params.username,
			                   allDorms: utils.allDorms()
			               });
	});
});

router.post('/:username/profile/edit', utils.isAuthenticated, function(req, res, next){
	var newPassword = req.body.newPassword.trim();
	var newPhoneNumber = parseInt(req.body.newPhoneNumber.trim());
	var dorm = req.body.dorm.trim();
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
