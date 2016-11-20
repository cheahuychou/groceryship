var express = require('express');
var router = express.Router();
var utils = require('../public/javascripts/utils.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:username', utils.isAuthenticated, function (req, res, next) { 
	res.render('dashboard', { title: 'Dashboard', username: req.params.username});
});

router.get('/:username/request', utils.isAuthenticated, function (req, res, next) { 
	res.render('request', { title: 'GroceryShip', username: req.params.username});
});

router.get('/:username/deliver', utils.isAuthenticated, function (req, res, next) { 
	res.render('deliver', { title: 'GroceryShip', username: req.params.username});
});

module.exports = router;
