var express = require('express');
var router = express.Router();
var Delivery = require('../models/delivery');
var User = require('../models/user');

/** Returns the "deliver" page consisting of all requests that a user can claim **/
router.get("/requests", function(req, res){
	var username = req.session.passport.user.username;
	var now = Date.now;
	User.find({username: username}, '_id', function(err, current_user) {
		Delivery.find({status: "pending", requester: {$ne: current_user._id}, deadline: {$gt: now}})
		        .exec(function(err, requestItems) {
		        	res.render('deliver', {title: 'Request Feed', requestItems: requestItems});
		        });
	});
});

/** Populates the dashboard page of the user, returning the lists of his current requests and current deliveries **/
router.get("/:username", function(req, res){
	var username = req.session.passport.user.username;
	User.find({username: username}, '_id', function(err, current_user) {
		Delivery.find({requester: current_user._id})
		        .exec(function(err, requestItems) {
		        	Delivery.find({shopper: current_user._id})
		        	        .exec(function(err, deliveryItems) {
		        	        	res.render('dashboard', {title: 'Dashboard', requestItems: requestItems, deliveryItems: deliveryItems});
		        	        });
		        });
	});
});

/**
Posts a new request from a user
request body fields (TODO: MIGHT NEED TO BE CHANGED): stores, item-due, item-name, itemDescription, item-qty, item-price-estimate, item-tip, item-pickup
**/
router.post("/", function(req, res){
	var username = req.session.passport.user.username;
	var stores = req.body.stores;
	var deadline = req.body.item-due;
	var itemName = req.body.item-name;
	var itemDescription = req.body.itemDescription;
	var itemQuantity = req.body.item-qty;
	var estimatedPrice = req.body.item-price-estimate;
	var tips = req.body.item-tip;
	var pickupLocation = req.body.item-pickup;
	User.find({username: username}, '_id', function(err, current_user) {
		Delivery.create({stores: stores, status: "pending", deadline: deadline, itemName: itemName, itemDescription: itemDescription,
	                     itemQuantity: itemQuantity, estimatedPrice: estimatedPrice, tips: tips, pickupLocation: pickupLocation, requester: current_user._id});

		res.end();
	})
});

/** Removes a Delivery when the user cancels the request **/
router.delete("/:id", function(req, res){
	var username = req.session.passport.user.username;
	Delivery.findOne({_id: id, requester: username}) //verify that the current user is the one who requested it
	     .remove()
	     .exec();

	res.end();
});

/** Updates a Delivery when a user claims that delivery **/
router.put("/:id/claim", function(req, res){
	var username = req.session.passport.user.username;
	User.find({username:username}, '_id', function(err, current_user) {
		Delivery.findOne({_id: id}, function(err, current_delivery) {
			current_delivery.status = "claimed";
			current_delivery.shopper = current_user._id;
			current_delivery.save(function(err) {if (err) console.log(err);});

			res.end();
		});
	});
});

/**
Updates a Delivery when a user clicks on "Deliver Now"
request body fields: pickupTime, actualPrice
**/
router.put("/:id/deliver", function(req, res){
	var username = req.session.passport.user.username;
	User.find({username: username}, '_id', function(err, current_user) {
		Delivery.findOne({_id: id, shopper: current_user._id}, function(err, current_delivery) {
			current_delivery.pickupTime = req.body.pickupTime;
			current_delivery.actualPrice = req.body.actualPrice;
			current_delivery.save(function(err) {if (err) console.log(err);});

			res.end();
		});
	});
});

/** Updates a Delivery when a user accepts the delivery **/
router.put("/:id/accept", function(req, res){
	var username = req.session.passport.user.username;
	User.find({username: username}, '_id', function(err, current_user) {
		Delivery.findOne({_id: id, shopper: current_user._id}, function(err, current_delivery) {
			current_delivery.status = "accepted";
			current_delivery.save(function(err) {if (err) console.log(err);});

			res.end();
		});
	});
});

/** Updates a Delivery when a user rejects the delivery **/
router.put("/:id/reject", function(req, res){
	var username = req.session.passport.user.username;
	User.find({username: username}, '_id', function(err, current_user) {
		Delivery.findOne({_id: id, shopper: current_user._id}, function(err, current_delivery) {
			current_delivery.status = "rejected";
			current_delivery.save(function(err) {if (err) console.log(err);});

			res.end();
		});
	});
});

module.exports = router;

