//Author: Joseph Kuan
var express = require('express');
var router = express.Router();
var Delivery = require('../models/delivery');
var User = require('../models/user');
var utils = require('../javascripts/utils.js');
var email = require('../javascripts/email.js');

/**
Returns the "deliver" page consisting of all requests that a user can claim
fields rendered: title & requestItems
**/
router.get("/requests", utils.isAuthenticated, function(req, res) {
    var now = Date.now();
    var user = req.session.passport.user;
    var stores = req.query.stores;
    var pickupLocations = req.query.pickupLocations;
    if (req.query.minRating) {
    	var minRating = parseInt(req.query.minRating);
    }
    var sortBy = req.query.sortBy;
    if (req.query.sortIncreasing) {
    	var sortIncreasing = parseInt(req.query.sortIncreasing);
    }
    Delivery.getRequests(user._id, now, stores, pickupLocations, minRating, [sortBy, sortIncreasing], function(err, requestItems) {
        if (err) {
        	console.log(err);
            res.send({'success': false, 'message': err});
        } else {
            res.render('deliver', {username: user.username,
                                   fullName: user.fullName,
            	                   title: 'Request Feed',
            	                   requestItems: utils.formatDate(requestItems),
            	                   allPickupLocations: utils.allPickupLocations(),
            	                   allStores: utils.allStores(),
            	                   previousStores: stores,
            	                   previousPickupLocations: pickupLocations,
            	                   previousMinRating: minRating,
            	                   previousSortBy: sortBy,
            	                   previousSortIncreasing: sortIncreasing
            	               });
        }
    });
});

/**
Populates the dashboard page of the user, returning the lists of his current requests and current deliveries
fields rendered: title, requestItems, deliveryItems
**/
router.get("/username/:username", utils.isAuthenticated, function(req, res){
    var now = Date.now();
    var user = req.session.passport.user;
    Delivery.getRequestsAndDeliveries(user._id, now, function(err, requestItems, deliveryItems) {
        if (err) {
            res.send({'success': false, 'message': err})
        } else {
            res.render('dashboard', {username: user.username,
                                     fullName: user.fullName,
            	                     title: 'Dashboard',
            	                     now: now,
            	                     requestItems: utils.formatDate(requestItems),
            	                     deliveryItems: utils.formatDate(deliveryItems),
            	                 });
        }
    });
});

//TODO: Remove this route if not needed.
//TODO: If implemented, remove sensitive information from json response.
/**
Populates the notification popup, returning the relevant request or delivery
fields returned: delivery
router.get("/id/:id", utils.isAuthenticated, function(req, res){
    var user = req.session.passport.user;
    Delivery.findOne({_id: req.params.id}).populate('shopper requester').lean().exec(function(err, current_delivery) {
        if (current_delivery === null) {
        	err = new Error("cannot find specified request or delivery.");
        }
        if (err) {
            res.json({'success': false, 'message': err})
        } else {
            res.json({'success': true, delivery: utils.formatDate([current_delivery])});
        }
    });
});
**/

/**
Posts a new request from a user
request body fields: stores, itemDue, itemName, itemDescription, itemQty, itemPriceEstimate, itemTips, itemPickupLocation
**/
router.post("/", utils.isAuthenticated, function(req, res){
    console.log(req.body);
    var stores = req.body['stores[]'];
    if (!stores) {
    	stores = utils.allStores();
    }
    var deadline = new Date(req.body.itemDue);
    var itemName = req.body.itemName;
    var itemDescription = req.body.itemDescription;
    var itemQuantity = req.body.itemQty;
    var estimatedPrice = parseFloat(req.body.itemPriceEstimate);
    var tips = parseFloat(req.body.itemTips);
    var pickupLocation = req.body.itemPickupLocation;
    Delivery.create({
        stores: stores,
        status: "pending",
        deadline: deadline,
        itemName: itemName,
        itemDescription: itemDescription,
        itemQuantity: itemQuantity,
        estimatedPrice: estimatedPrice,
        tips: tips,
        pickupLocation: pickupLocation,
        requester: req.session.passport.user._id
    }, function(err, newDelivery) {
        if (err) {
            console.log(err);
            res.json({success: false, message: err});
        } else {
            res.json({success:  true});            
        }
    });
});

/** Removes a Delivery when the user cancels the request **/
router.delete("/:id", utils.isAuthenticated, function(req, res){
    var userId = req.session.passport.user._id;
    Delivery.findOne({_id: req.params.id, requester: userId, status: "pending"}, function(err, current_delivery) { //verify that the current user is the one who requested it. Also,
    	                                                                                                           //verify that the request has not been claimed
        if (current_delivery === null) {
        	err = new Error("cannot find specified request. Request might have been claimed");
        }
        if (err) {
        	console.log(err);
        	res.json({success: false, message: err});
        } else {
        	current_delivery.remove(function(err, data) {
	            if (err) {
	                console.log(err);
	                res.json({success: false, message: err});
	            } else {
	                res.json({success: true});
	            }
        	});
        }
    });
});

/** Updates a Delivery when a user claims that delivery **/
router.put("/:id/claim", utils.isAuthenticated, function(req, res){
    var user = req.session.passport.user;
    Delivery.findOne({_id: req.params.id}, function(err, currentDelivery) {
        console.log(currentDelivery);
    	if (currentDelivery === null) {
    		err = new Error("cannot find specified request")
    	}
    	if (err) {
    		console.log(err);
    		res.json({success: false, message: err});
    	} else {
	        currentDelivery.claim(user._id, function(err) {
	            if (err) {
	                console.log(err);
	                res.json({success: false, message: err});
	            } else {
                    Delivery.findOne({_id: req.params.id})
                        .populate('shopper', '-password -stripeId -stripeEmail -verificationToken -dorm') //exclude sensitive information from populate
                        .populate('requester', '-password -stripeId -stripeEmail -verificationToken -dorm').exec(function(err, currentDelivery) {
                            email.sendDeliveryEmail(currentDelivery)
	                       res.json({success: true});
                       });
	            }
	        });
    	}
    });
});

/**
Updates a Delivery when a user clicks on "Deliver Now"
request body fields: pickupTime, actualPrice
**/
router.put("/:id/deliver", utils.isAuthenticated, function(req, res){
    var user = req.session.passport.user;
    Delivery.findOne({_id: req.params.id, shopper: user._id})
        .populate('shopper', '-password -stripeId -stripeEmail -verificationToken -dorm') //exclude sensitive information from populate
        .populate('requester', '-password -stripeId -stripeEmail -verificationToken -dorm').exec(function(err, currentDelivery) {
        	console.log(currentDelivery);
            if (currentDelivery === null) {
                err = new Error("cannot find specified request")
            }
            if (err) {
                console.log(err);
                res.json({success: false, message: err});
            } else {
                currentDelivery.deliver(new Date(req.body.pickupTime), parseFloat(req.body.actualPrice), function(err) {
                    if (err) {
                        console.log(err);
                        res.json({success: false, message: err});
                    } else {
                        res.json({success: true, item: utils.formatDate([currentDelivery])[0]});
                    }
                });
            }
        });
});

/** Updates a Delivery when a user accepts the delivery **/
router.put("/:id/accept", utils.isAuthenticated, function(req, res){
    var user = req.session.passport.user;
    Delivery.findOne({_id: req.params.id, requester: user._id})
        .populate('shopper', '-password -stripeId -stripeEmail -verificationToken -dorm') //exclude sensitive information from populate
        .populate('requester', '-password -stripeId -stripeEmail -verificationToken -dorm').exec(function(err, currentDelivery) {
        if (currentDelivery === null) {
            err = new Error("cannot find specified request")
        }
        if (err) {
            console.log(err);
            res.json({success: false, message: err});
        } else {
            currentDelivery.accept(function(err) {
                if (err) {
                    console.log(err);
                    res.json({success: false, message: err});
                } else {
                    email.sendAcceptanceEmails(currentDelivery.shopper, currentDelivery.requester)
                    res.json({success: true});
                }
            });
        }
    });
});

/** Updates a Delivery when a user rejects the delivery **/
router.put("/:id/reject", utils.isAuthenticated, function(req, res){
    var user = req.session.passport.user;
    Delivery.findOne({_id: req.params.id, requester: user._id})
        .populate('shopper', '-password -stripeId -stripeEmail -verificationToken -dorm') //exclude sensitive information from populate
        .populate('requester', '-password -stripeId -stripeEmail -verificationToken -dorm').exec(function(err, currentDelivery) {
        if (currentDelivery === null) {
            err = new Error("cannot find specified request")
        }
        if (err) {
            console.log(err);
            res.json({success: false, message: err});
        } else {
            currentDelivery.reject(function(err) {
                if (err) {
                    console.log(err);
                    res.json({success: false, message: err});
                } else {
                    email.sendRejectionEmails(currentDelivery.shopper, currentDelivery.requester)
                    res.json({success: true});
                }
            });
        }
    });
});

module.exports = router;

