var express = require('express');
var router = express.Router();
var Delivery = require('../models/delivery');

router.get("/", function(req, res){
	var username = req.session.passport.user.username;
	Delivery.find({requester: username})
	        .exec(function(err, requestList) {
	        	Delivery.find({shopper: username})
	        	        .exec(function(err, shopperList) {
	        	        	res.render('dashboard', {title: 'Dashboard', username: username, request: requestList, deliver: shopperList});
	        	        });
	        });
});

router.post("/", function(req, res){
	var username = req.session.passport.user.username;
	var stores = req.body.stores;
	var deadline = req.body.deadline;
	var itemName = req.body.itemName;
	var itemDescription = req.body.itemDescription;
	var itemQuantity = req.body.itemQuantity;
	var estimatedPrice = req.body.estimatedPrice;
	var tips = req.body.tips;
	var pickupLocation = req.body.pickupLocation;
	Delivery.create({stores: stores, status: "pending", deadline: deadline, itemName: itemName, itemDescription: itemDescription,
                     itemQuantity: itemQuantity, estimatedPrice: estimatedPrice, tips: tips, pickupLocation: pickupLocation, requester: username});
	
	res.end();
});

router.get("/:id", function(req, res){

});

router.delete("/:id", function(req, res){
	var username = req.session.passport.user.username;
	Freet.findOne({_id: id, requester: username}) //verify that the current user is the one who requested it
	     .remove()
	     .exec();

	res.end();
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

