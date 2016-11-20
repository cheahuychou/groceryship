var express = require('express');
var router = express.Router();
var Delivery = require('../models/delivery');

router.get("/", function(req, res){
	var username = req.session.passport.user.username;
	var userID //TODO
	var 
	Delivery.find({requester: userID})
	        .exec(function(err, requestList) {
	        	Delivery.find({shopper: userID})
	        	        .exec(function(err, shopperList) {
	        	        	
	        	        })
	        })
    res.render('dashboard', { title: 'Dashboard', username: req.params.username});
});

router.post("/", function(req, res){

});

router.get("/:id", function(req, res){

});

router.delete("/:id", function(req, res){

});

router.put("/:id/claim", function(req, res){

});

router.put("/:id/deliver", function(req, res){

});

router.put("/:id/accept", function(req, res){

});

router.put("/:id/reject", function(req, res){

});

module.exports = router;

