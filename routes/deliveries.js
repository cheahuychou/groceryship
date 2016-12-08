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
var PUBLISHABLE_KEY = process.env.PUBLISHABLE_API_KEY || config.stripePublishableKey();
var stripe = stripe(PUBLISHABLE_KEY);
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

/**
Posts a new request from a user
request body fields: stores, itemDue, itemName, itemDescription, itemQty, itemPriceEstimate, itemTips, itemPickupLocation, minShippingRating
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
    var minShippingRating = parseFloat(req.body.minShippingRating);
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
        minShippingRating: minShippingRating
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
    Delivery.cancel(req.params.id, userId, function(err) {
        if (err) {
            console.log(err);
            res.json({success: false, message: err});
        } else {
        	res.json({success: true});
        }
    });
});

/** Updates a request when the user closes an "expired" notification, indicated the user has seen that the request is expired **/
router.put("/:id/seeExpired", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res) {
	var user = req.session.passport.user;
	Delivery.seeExpired(req.params.id, user._id, function(err) {
		if (err) {
			console.log(err);
			res.json({success: false, message: err});
		} else {
			res.json({success: true});
		}
	});
});

/** Updates a Delivery when a user claims that delivery **/
router.put("/:id/claim", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res){
    var user = req.session.passport.user;
    Delivery.claim(req.params.id, user._id, function(err, claimedDelivery) {
    	if (err) {
    		console.log(err);
    		res.json({success: false, message: err});
    	} else {
    		email.sendClaimEmail(claimedDelivery);
    		res.json({success: true});
    	}
    });
});

/**
Updates a Delivery when a user clicks on "Deliver Now"
request body fields: pickupTime, actualPrice
**/
router.put("/:id/deliver", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res){
    var user = req.session.passport.user;
    Delivery.deliver(req.params.id, user._id, new Date(req.body.pickupTime), parseFloat(req.body.actualPrice), function(err, currentDelivery) {
        if (err) {
            console.log(err);
            res.json({success: false, message: err});
        } else {
        	console.log(currentDelivery);
            var formattedDelivery = utils.formatDate([currentDelivery])[0];
            email.sendDeliveryEmail(formattedDelivery);
            res.json({success: true});
        }
    });
});

/**
Updates a Delivery & process transaction when a user accepts the delivery
request body fields: cardNumber, expMonth, expYear, cvc, shopperRating
**/
router.put("/:id/accept", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res){
    var user = req.session.passport.user;
    
    //first, get the current delivery data along with the necessary information for stripe transaction
    Delivery.findOne({_id: req.params.id, requester: user._id, status: "claimed", actualPrice: {$ne: null}})
        .populate('shopper', '-password -stripePublishableKey -stripeEmail -verificationToken -dorm') //exclude sensitive information from populate
        .populate('requester', '-password -stripeId -stripePublishableKey -stripeEmail -verificationToken -dorm')
        .exec(function(err, currentDelivery) {
        if (currentDelivery === null) {
            err = new Error("cannot find specified request")
        }
        if (err) {
            console.log(err);
            res.json({success: false, message: err});
        } else {
        	stripe.tokens.create({card: {'number': req.body.cardNumber, //create tokens from credit card details
					                        'exp_month': req.body.expMonth,
					                        'exp_year': req.body.expYear,
					                        'cvc': req.body.cvc}
        	}, function(err, token) {
        		if (err) {
                    console.log(err);
                    res.json({success: false, message: "Invalid card."});
        		} else {
                    stripePlatform.charges.create({ //process the transaction
                        amount: (currentDelivery.actualPrice + currentDelivery.tips) * 100,
                        currency: 'usd',
                        source: token.id,
                        destination: currentDelivery.shopper.stripeId
                    }, function(err, data) {
                    	if (err) {
                            console.log(err)
                            res.json({success: false, message: "Invalid transaction."});
                        } else {
                            //store in the database that the delivery is accepted only after transaction is successful
                            currentDelivery.accept(data.id, req.body.shopperRating, function(err, newRating) {
                                if (err) {
                                    console.log(err);
                                    res.json({success: false, message: err});
                                } else {
                                    email.sendAcceptanceEmails(utils.formatDate([currentDelivery])[0]);
                                    res.json({success: true, newRating: newRating});
                                }
                            });
                        }
                    });
        		}
        	});
        }
    });
});

/**
Updates a Delivery when a user rejects the delivery
request body fields: shopperRating, reason
**/
router.put("/:id/reject", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res){
    var user = req.session.passport.user;
    Delivery.reject(req.params.id, user._id, req.body.reason, parseInt(req.body.shopperRating), function(err, currentDelivery, newRating) {
        if (err) {
            console.log(err);
            res.json({success: false, message: err});
        } else {
            email.sendRejectionEmails(utils.formatDate([currentDelivery])[0]);
            res.json({success: true, newRating: newRating});
        }
    });
});

/**
Sets requester rating of the delivery
request body fields: requesterRating
**/
router.put("/:id/rateRequester", authentication.isAuthenticated, parseForm, csrfProtection, function(req, res){
    var user = req.session.passport.user;
    Delivery.rateRequester(req.params.id, user._id, parseInt(req.body.requesterRating), function(err, newRating) {
        if (err) {
            console.log(err);
            res.json({success: false, message: err});
        } else {
            res.json({success: true, newRating: newRating});
        }
    });
});

module.exports = router;
