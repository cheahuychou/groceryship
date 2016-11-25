var express = require('express');
var router = express.Router();
var utils = require('../public/javascripts/utils.js');
var User = require('../models/user.js');

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

router.get('/:username/profile', utils.isAuthenticated, function (req, res, next) {
	User.findOne({'username': req.session.passport.user.username}, function(err, userObject){
		res.render('profile', {title: 'Profile Page', user: userObject, username: userObject.username});
	});
});

module.exports = router;
