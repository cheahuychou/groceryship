//Author: Joseph Kuan
var express = require('express');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var router = express.Router();
var Delivery = require('../models/delivery');
var User = require('../models/user');
var utils = require('../javascripts/utils.js');
var email = require('../javascripts/email.js');
var config = require('../javascripts/config.js');
var stripe = require('stripe');
var API_KEY = process.env.STRIPE_API_KEY || config.stripeApiKey();
var stripePlatform = stripe(API_KEY);
var authentication = require('../javascripts/authentication.js');

// setup csurf middlewares 
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

/**
Returns the "deliver" page consisting of all requests that a user can claim
fields rendered: title & requestItems
**/
router.get("/", authentication.isAuthenticated, function(req, res) {
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
        	if (err.message = "User has been suspended from making deliveries") {
        		res.render('suspended', {username: user.username,
        			                     fullName: user.fullName,
        		                         title: 'Suspended :(',
        		                         suspendedUntil: err.suspendedUntil,
        		                         csrfToken: req.csrfToken()
        		                     });
        	} else {
	        	console.log(err);
	            res.send({'success': false, 'message': err});
        	}
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
            	                   previousSortIncreasing: sortIncreasing,
                                   csrfToken: req.csrfToken()
            	               });
        }
    });
});

/**
Populates the dashboard page of the user, returning the lists of his current requests and current deliveries
fields rendered: title, requestItems, deliveryItems
**/
router.get("/username/:username", authentication.isAuthenticated, function(req, res){
    var now = Date.now();
    var user = req.session.passport.user;
    Delivery.getRequestsAndDeliveries(user._id, function(err, requestItems, deliveryItems) {
        if (err) {
            res.send({'success': false, 'message': err})
        } else {
            res.render('dashboard', {username: user.username,
                                     fullName: user.fullName,
            	                     title: 'Dashboard',
            	                     now: now,
            	                     requestItems: utils.formatDate(requestItems),
            	                     deliveryItems: utils.formatDate(deliveryItems),
                                     csrfToken: req.csrfToken()
            	                 });
        }
    });
});

//TODO: Remove this route if not needed.
//TODO: If implemented, remove sensitive information from json response.
/**
Populates the notification popup, returning the relevant request or delivery
fields returned: delivery
router.get("/id/:id", authentication.isAuthenticated, function(req, res){
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
router.post("/", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res){
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
    //var minShippingRating = parseFloat(req.body.minShippingRating); //TODO: uncomment this code once minShippingRating is implemented in front end!
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
        requester: req.session.passport.user._id,
        //minShippingRating: minShippingRating
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
router.delete("/:id", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res){
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

/** Updates a request when the user closes an "expired" notification, indicated the user has seen that the request is expired **/
router.put("/:id/seeExpired", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res) {
	var user = req.session.passport.user;
	Delivery.findOne({_id: req.params.id, requester: user._id}).exec(function(err, currentDelivery) { //verify that the current user is the one who requested it
    	if (currentDelivery === null) {
    		err = new Error("cannot find specified request")
    	}
		if (err) {
			console.log(err);
			res.json({success: false, message: err});
		} else {
			currentDelivery.seeExpired(function(err) {
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
router.put("/:id/claim", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res){
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
                            email.sendClaimEmail(currentDelivery);
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
router.put("/:id/deliver", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res){
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
                        var formattedDelivery = utils.formatDate([currentDelivery])[0];
                        email.sendDeliveryEmail(formattedDelivery);
                        res.json({success: true, item: formattedDelivery});
                    }
                });
            }
        });
});

/** Updates a Delivery when a user accepts the delivery **/
router.put("/:id/accept", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res){
    var user = req.session.passport.user;
    var stripeUser = stripe(user.stripePublishableKey);
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
            User.findById(currentDelivery.shopper, function(err, shopper){
                stripeUser.tokens.create({
                    card: {
                        'number': req.body.cardNumber,
                        'exp_month': req.body.expMonth,
                        'exp_year': req.body.expYear,
                        'cvc': req.body.cvc 
                    }
                }, function(err, token){
                    if (err){
                        console.log(err);
                        res.json({success: false, message: "Invalid card."});
                    } else {
                        stripePlatform.charges.create({
                            amount: (currentDelivery.actualPrice + currentDelivery.tips) * 100,
                            currency: 'usd',
                            source: token.id,
                            destination: shopper.stripeId
                        }, function(err, data){
                            if (err){
                                console.log(err)
                                res.json({success: false, message: "Invalid transaction."});
                            } else {
                                console.log(data.id);
                                currentDelivery.accept(data.id, req.body.shopperRating, function(err) {
                                    if (err) {
                                        console.log(err);
                                        res.json({success: false, message: err});
                                    } else {
                                        email.sendAcceptanceEmails(utils.formatDate([currentDelivery])[0]);
                                        res.json({success: true});
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
    });
});

/** Updates a Delivery when a user rejects the delivery **/
router.put("/:id/reject", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res){
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
            currentDelivery.reject(req.body.reason, parseInt(req.body.shopperRating), function(err) {
                if (err) {
                    console.log(err);
                    res.json({success: false, message: err});
                } else {
                    email.sendRejectionEmails(utils.formatDate([currentDelivery])[0]);
                    res.json({success: true});
                }
            });
        }
    });
});

/** Sets requester rating of the delivery **/
router.put("/:id/rateRequester", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res){
    var user = req.session.passport.user;
    Delivery.findOne({_id: req.params.id, shopper: user._id}, function(err, currentDelivery) {
        if (currentDelivery === null) {
            err = new Error("cannot find specified request")
        }
        if (err) {
            console.log(err);
            res.json({success: false, message: err});
        } else {
            currentDelivery.rateRequester(parseInt(req.body.requesterRating), function(err) {
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

module.exports = router;

