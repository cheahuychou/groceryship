var express = require('express');
var router = express.Router();
var request = require('request');
var bcrypt = require('bcrypt');
var User = require('../models/user.js');
var utils = require('../javascripts/utils.js');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:username', utils.isAuthenticated, function (req, res, next) { 
	res.render('dashboard', { title: 'Dashboard', username: req.params.username});
});

router.get('/:username/request', utils.isAuthenticated, function (req, res, next) { 
	res.render('request', { title: 'Request for a Delivery', username: req.params.username});
});

router.get('/:username/deliver', utils.isAuthenticated, function (req, res, next) { 
	res.render('deliver', { title: 'Request Feed', username: req.params.username});
});

router.get('/:username/validate', function(req, res) {
    // check valid kerberos
    // if (app.get('env') === 'development') {
        var clientId = process.env.MIT_API_ID;
        var clientSecret = process.env.MIT_API_SECRET;
        console.log(clientId, clientSecret);

        var options = {
            url: 'https://mit-public.cloudhub.io/people/v3/people/'+req.params.username,
            headers: {
              client_id: clientId,
              client_secret: clientSecret
            }
        };

        request(options, function(err, response, body) {
            if (err) {
                res.json({success: false, message: err});
            } else {
                res.json({success: true});
                console.log(body);
            }
            console.log(err, body);
        });
    // }
});

router.get('/:username/profile', utils.isAuthenticated, function (req, res, next) {
	User.findOne({'username': req.params.username}, function(err, user){
		res.render('profile', {title: 'Profile Page', user: user, username: req.params.username});
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
