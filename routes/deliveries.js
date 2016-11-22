var express = require('express');
var router = express.Router();
var Delivery = require('../models/delivery');
var User = require('../models/user');
var utils = require('../public/javascripts/utils.js');

/**
Returns the "deliver" page consisting of all requests that a user can claim
fields rendered: title & requestItems
**/
router.get("/requests", utils.isAuthenticated, function(req, res) {
    var now = Date.now();
    var user = req.session.passport.user;
    Delivery.find({status: "pending", requester: {$ne: user._id}, deadline: {$gt: now}})
        .lean().exec(function(err, requestItems) {
            if (err) {
                res.send({'success': false, 'message': err});
            } else {
                res.render('deliver', {username: user.username, title: 'Request Feed', requestItems: utils.formatDate(requestItems)});
            }
        });
});

/**
Populates the dashboard page of the user, returning the lists of his current requests and current deliveries
fields rendered: title, requestItems, deliveryItems
**/
router.get("/:username", utils.isAuthenticated, function(req, res){
    var user = req.session.passport.user;
    Delivery.find({requester: user._id})
            .lean().exec(function(err, requestItems) {
                if (err) {
                    res.send({'success': false, 'message': err});
                } else {
                    Delivery.find({shopper: user._id})
                        .lean().exec(function(err, deliveryItems) {
                            if (err) {
                                res.send({'success': false, 'message': err})
                            } else {
                                res.render('dashboard', {username: user.username, title: 'Dashboard', requestItems: utils.formatDate(requestItems), deliveryItems: utils.formatDate(deliveryItems)});
                            }
                        });
                }
            });
});

/**
Posts a new request from a user
request body fields (TODO: MIGHT NEED TO BE CHANGED): stores, item-due, item-name, itemDescription, item-qty, item-price-estimate, item-tip, item-pickup
**/
router.post("/", utils.isAuthenticated, function(req, res){
    var stores = [req.body.stores];
    var deadline = new Date(req.body.itemDue);
    var itemName = req.body.itemName;
    var itemDescription = req.body.itemDescription;
    var itemQuantity = req.body.itemQty;
    var estimatedPrice = parseInt(req.body.itemPriceEstimate);
    var tips = parseInt(req.body.itemTips);
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
    Delivery.findOne({_id: req.params.id, requester: userId}) //verify that the current user is the one who requested it
         .remove()
         .exec(function(err, data) {
            if (err) {
                console.log(err);
                res.json({success: false, message: err});
            } else {
                res.json({success: true});
            }
         });
});

/** Updates a Delivery when a user claims that delivery **/
router.put("/:id/claim", utils.isAuthenticated, function(req, res){
    var user = req.session.passport.user;
    Delivery.findOne({_id: req.params.id}, function(err, current_delivery) {
        current_delivery.status = "claimed";
        current_delivery.shopper = user._id;
        current_delivery.save(function(err) {
            if (err) {
                console.log(err);
                res.json({success: false, message: err});
            } else {
                res.json({success: true});
            }
        });
    });
});

/**
Updates a Delivery when a user clicks on "Deliver Now"
request body fields: pickupTime, actualPrice
**/
router.put("/:id/deliver", utils.isAuthenticated, function(req, res){
    var user = req.session.passport.user;
    Delivery.findOne({_id: req.params.id, shopper: user._id}, function(err, current_delivery) {
        current_delivery.pickupTime = new Date(req.body.pickupTime);
        current_delivery.actualPrice = req.body.actualPrice;
        current_delivery.save(function(err) {
            if (err) {
                console.log(err);
                res.json({success: false, message: err});
            } else {
                res.json({success: true});
            }
        });
    });
});

/** Updates a Delivery when a user accepts the delivery **/
router.put("/:id/accept", utils.isAuthenticated, function(req, res){
    var user = req.session.passport.user;
    Delivery.findOne({_id: req.params.id, shopper: user._id}, function(err, current_delivery) {
        current_delivery.status = "accepted";
        current_delivery.save(function(err) {
            if (err) {
                console.log(err);
                res.json({success: false, message: err});
            } else {
                res.json({success: true});
            }
        });
    });
});

/** Updates a Delivery when a user rejects the delivery **/
router.put("/:id/reject", utils.isAuthenticated, function(req, res){
    var user = req.session.passport.user;
    Delivery.findOne({_id: req.params.id, shopper: user._id}, function(err, current_delivery) {
        current_delivery.status = "rejected";
        current_delivery.save(function(err) {
            if (err) {
                console.log(err);
                res.json({success: false, message: err});
            } else {
                res.json({success: true});
            }
        });
    });
});

module.exports = router;

