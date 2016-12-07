//Author: Joseph Kuan
var mongoose = require("mongoose");
var User = require("./user.js");
var utils = require("../javascripts/utils.js");
var ObjectId = mongoose.Schema.Types.ObjectId;

var DeliverySchema = mongoose.Schema({
    stores: [{type: String, required: true}], // A list of possible grocery stores.
    status: {type: String, required: true},
    deadline: {type: Date, required: true},
    itemName: {type: String, required: true},
    itemDescription: {type: String, default: null},
    itemQuantity: {type: String, required: true},
    estimatedPrice: {type: Number, required: true},
    tips: {type: Number, required: true},
    pickupLocation: {type: String, required: true},
    requester: {type: ObjectId, ref: "User", required: true},
    shopper: {type: ObjectId, ref: "User", default: null},
    actualPrice: {type: Number, default: null},
    pickupTime: {type: Date, default: null},
    requesterRating: {type: Number, default: null}, // The rating that the shopper gives the requester
    shopperRating: {type: Number, default: null}, // The rating that the requester gives the shopper
    rejectedReason: {type: String, required: false},
    seenExpired: {type: Boolean, default: false}, // Denotes whether the requester has seen that an unclaimed request is past the deadline. Used in populating notifications.
    stripeTransactionId: {type: String, required: false},
    minShippingRating: {type: Number, default: 1} // Only shoppers with a shipping rating above this value are allowed to deliver this item
}); 

DeliverySchema.path("stores").validate(function(stores) {
    return stores.reduce(function(a, b) {
        return a && (utils.allStores().indexOf(b) > -1);
    }, true);
}, "Not a valid grocery store");

DeliverySchema.path("status").validate(function(status) {
    return status == "pending" || status == "claimed" || status == "rejected" || status == "accepted";
}, "Not a valid status");

DeliverySchema.path("shopper").validate(function(shopperId) {
	return (shopperId === null) || (shopperId.toString() !== this.requester.toString());
}, "The shopper and the requester should not be the same.");

DeliverySchema.path("deadline").validate(function(deadline) {
    return deadline >= this.pickupTime;
}, "The dealine has passed.");

DeliverySchema.path("estimatedPrice").validate(function(value) {
    return value > 0;
}, "Estimated Price cannot be negative");

DeliverySchema.path("tips").validate(function(value) {
    return value >= 0;
}, "Tips cannot be negative");

DeliverySchema.path("actualPrice").validate(function(value) {
    return value === null || value > 0;
}, "Actual Price cannot be negative");

DeliverySchema.path("pickupLocation").validate(function(value) {
    return value.trim().length > 0 && utils.allPickupLocations().indexOf(value) > -1;
}, "Not a valid pickup location name");

DeliverySchema.path("requesterRating").validate(function(rating) {
    return rating == 1 || rating == 2 || rating == 3 || rating == 4 || rating == 5 || rating === null;
}, "A requester rating should be ranged from 1 to 5.");

DeliverySchema.path("shopperRating").validate(function(rating) {
    return rating == 1 || rating == 2 || rating == 3 || rating == 4 || rating == 5 || rating === null;
}, "A shopper rating should be ranged from 1 to 5.");

/**
 * Deletes a pending request when the requester cancels
 * @param {ObjectId} id - The ID of the delivery to be deleted
 * @param {ObjectId} requesterId - The ID of the requester of the delivery
 * @param {Function} callback - The function to execute after request is deleted. Callback
 * function takes 1 parameter: an error when the operation is not properly executed
 */
DeliverySchema.statics.cancel = function(id, requesterId, callback) {
    this.findOne({_id: id, requester: requesterId, status: "pending"}, function(err, current_delivery) { //verify that the current user is the one who requested it. Also,
                                                                                                         //verify that the request has not been claimed
        if (current_delivery === null) {
            err = new Error("cannot find specified request. Request might have been claimed");
        }
        if (err) {
            callback(err);
        } else {
            current_delivery.remove(function(err, data) {
                callback(err);
            });
        }
    });
};

/**
 * Marks an expired pending request as seen that it is expired.
 * @param {ObjectId} id - The ID of the delivery to be marked as seenExpired = true
 * @param {ObjectId} requesterId - The ID of the requester of the delivery
 * @param {Function} callback - The function to execute after request is marked as seenExpired = true. Callback
 * function takes 1 parameter: an error when the operation is not properly executed
 */
DeliverySchema.statics.seeExpired = function(id, requesterId, callback) {
    var now = new Date();
    this.findOne({_id: id, requester: requesterId}).exec(function(err, currentDelivery) { //verify that the correct user is the one who requested it
        if (currentDelivery === null) {
            err = new Error("cannot find specified request");
        } else if (currentDelivery.deadline > now) {
            err = new Error("request has not expired yet");
        }
        if (err) {
            callback(err);
        } else {
            currentDelivery.seenExpired = true;
            currentDelivery.save(callback);
        }
    });
};

/**
 * Claims a pending request. Feeds an error into the callback if the request has already been claimed, shopper shipping rating is too low, shopper is suspended, or request has expired
 * @param {ObjectId} id - The ID of the delivery to be claimed
 * @param {ObjectId} shopperID - The id of the shopper that is claiming the request
 * @param {Function} callback - The function to execute after request is claimed. Callback
 * function takes 2 parameters: an error when the request is not properly claimed, and the claimed delivery object
 */
DeliverySchema.statics.claim = function(id, shopperID, callback) {
    var now = Date.now();
    var Delivery = this;
    this.findOne({_id: id}, function(err, currentDelivery) {
        if (currentDelivery === null) {
            err = new Error("cannot find specified request");
        } else if (currentDelivery.status !== "pending") {
            err = new Error("request has already been claimed");
        } else if (currentDelivery.deadline < now) {
            err = new Error("request deadline has already past");
        }
        if (err) {
            callback(err, null);
        } else {
            User.findOne({_id: shopperID}, function(err, currentUser) {
                if (currentUser.avgShippingRating < currentDelivery.minShippingRating) {
                    err = new Error("shopper shipping rating is too low");
                } else if (currentUser.suspendedUntil > now) {
                    err = new Error("shopper is suspended");
                }
                if (err) {
                    callback(err, null);
                } else {
                    currentDelivery.status = "claimed";
                    currentDelivery.shopper = shopperID;
                    currentDelivery.save(function(err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            Delivery.populate(currentDelivery,
                                              {path:"shopper requester", select: '-password -stripeId -stripePublishableKey -stripeEmail -verificationToken -dorm'}, //exclude sensitive information from populate
                                              function(err, currentDelivery) {
                                callback(err, currentDelivery);
                            });
                        }
                    });
                }
            });
        }
    });
};



/**
 * "Delivers" a claimed request, assigning the delivery a pickupTime and an actualPrice
 * @param {ObjectId} id - The ID of the delivery
 * @param {ObjectId} shopperID - The id of the shopper that is delivering the good
 * @param {Date} pickupTime - The pickup time of the delivery
 * @param {Number} actualPrice - The actual price of the good
 * @param {Function} callback - The function to execute after request is delivered. Callback
 * function takes 2 parameters: an error when the request is not properly claimed, and the delivery object
 */
DeliverySchema.statics.deliver = function(id, shopperID, pickupTime, actualPrice, callback) {
    this.findOne({_id: id, shopper: shopperID})
        .populate('shopper', '-password -stripeId -stripePublishableKey -stripeEmail -verificationToken -dorm') //exclude sensitive information from populate
        .populate('requester', '-password -stripeId -stripePublishableKey -stripeEmail -verificationToken -dorm').exec(function(err, currentDelivery) {
            if (currentDelivery === null) {
                err = new Error("cannot find specified request")
            }
            if (err) {
                callback(err, null);
            } else {
                currentDelivery.pickupTime = pickupTime;
                currentDelivery.actualPrice = actualPrice;
                currentDelivery.save(function(err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(err, currentDelivery);
                    }
                });
            }
        });
};

/**
 * Accepts a claimed request. Feeds an error into the callback if the request is not in claimed stage
 * @param {String} transactionId - The ID of the stripe transaction of this delivery
 * @param {Number} shopperRating - The rating that the requester gives the shopper, must be an integer between 1 to 5
 * @param {Function} callback - The function to execute after request is accepted. Callback
 * function takes 2 parameters: an error when the accept is not properly saved, and the new rating
 */
DeliverySchema.methods.accept = function(transactionId, shopperRating, callback) {
    if (this.status !== "claimed") {
        callback(new Error("request is either pending or is already accepted/rejected"), null);
    } else if (this.actualPrice === null) {
        callback(new Error ("price of good has not been set yet"), null)
    } else {
        this.status = "accepted";
        this.stripeTransactionId = transactionId;
        this.shopperRating = shopperRating;
        var shopperID = this.shopper;
        var thisID = this._id;
        this.save(function(err) {
            if (err) {
                callback(err, null);
            } else {
                User.addCompletedShipping(shopperID, thisID, shopperRating, callback);
            }
        });
    }
};

/**
 * Rejects a claimed request. Feeds an error into the callback if the request is not in claimed stage
 * @param {ObjectId} id - The ID of the delivery
 * @param {ObjectId} requesterID - The id of the user requesting the good
 * @param {String} reason - The requester's reason for rejecting the delivery
 * @param {Number} shopperRating - The rating that the requester gives to the shopper, must be an integer between 1 to 5
 * @param {Function} callback - The function to execute after request is rejected. Callback
 * function takes 3 parameters: an error when the reject is not properly saved, the delivery object, and the new rating
 */
DeliverySchema.statics.reject = function(id, requesterID, reason, shopperRating, callback) {
    this.findOne({_id: id, requester: requesterID, status: "claimed"})
        .populate('shopper', '-password -stripeId -stripePublishableKey -stripeEmail -verificationToken -dorm') //exclude sensitive information from populate
        .populate('requester', '-password -stripeId -stripePublishableKey -stripeEmail -verificationToken -dorm').exec(function(err, currentDelivery) {
        if (currentDelivery === null) {
            err = new Error("cannot find specified request")
        } else if (reason.length == 0) {
            err = new Error("reason cannot be empty");
        }
        if (err) {
            callback(err, null);
        } else {
            currentDelivery.status = "rejected";
            currentDelivery.rejectedReason = reason;
            currentDelivery.shopperRating = shopperRating;
            currentDelivery.save(function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    User.addCompletedShipping(currentDelivery.shopper._id, id, shopperRating, function(err, newRating) {
                        callback(err, currentDelivery, newRating);
                    });
                }
            });
        }
    });
};

/**
 * Rejects a claimed request. Feeds an error into the callback if the request is not in claimed stage
 * @param {ObjectId} id - The ID of the delivery
 * @param {ObjectId} shopperID - The id of the user delivering the good
 * @param {Number} requesterRating - The rating that the shopper gives to the requester, must be an integer between 1 to 5
 * @param {Function} callback - The function to execute after request is rejected. Callback
 * function takes 2 parameters: an error when the rating is not properly saved, and the new rating
 */
DeliverySchema.statics.rateRequester = function(id, shopperID, requesterRating, callback) {
    this.findOne({_id: id, shopper: shopperID}, function(err, currentDelivery) {
        if (currentDelivery === null) {
            err = new Error("cannot find specified request");
        } else if (currentDelivery.status === "pending") {
            err = new Error("cannot rate the shopper without claiming his/her delivery");
        }
        if (err) {
            callback(err, null);
        } else {
            currentDelivery.requesterRating = requesterRating;
            currentDelivery.save(function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    User.addCompletedRequest(currentDelivery.requester, currentDelivery._id, requesterRating, callback);
                }
            });
        }
    });
};

/**
 * Searches for a user's relevant requests and deliveries to be displayed on dashboard, and returns it.
 * Returned requests of user include:
 *    - requests that are pending, except those where seenExpired = true (where user already knows they are expired)
 *    - all claimed requests (does not include accepted/rejected requests)
 * Returned deliveries of user include:
 *    - all deliveries except those where the user has already rated the requester
 * @param {ObjectId} userID - The id of the relevant user
 * @param {Function} callback - The callback to execute after the lists are returned. Executed as callback(err, requestItems, deliveryItems)
 */
DeliverySchema.statics.getRequestsAndDeliveries = function(userID, callback) {
    this.find({requester: userID, status: "claimed"})
        .sort({pickupTime: 1})
        .populate('shopper', '-password -stripeId -stripePublishableKey -stripeEmail -verificationToken -dorm -avgRequestRating') //exclude sensitive information
        .lean().exec(function(err, requestItemsClaimed) {
            if (err) {
                callback(err, requestItemsClaimed, null);
            } else {
                mongoose.model('Delivery', DeliverySchema)
                    .find({requester: userID, status: "pending", seenExpired: false})
                    .sort({deadline: 1})
                    .populate('shopper', '-password -stripeId -stripePublishableKey -stripeEmail -verificationToken -dorm -avgRequestRating') //exclude sensitive information
                    .lean().exec(function(err, requestItemsPending) {
                        if (err) {
                            callback(err, requestItemsClaimed, null);
                        } else {
                            var requestItems = requestItemsClaimed.concat(requestItemsPending);
                            mongoose.model('Delivery', DeliverySchema)
                                .find({shopper: userID, requesterRating: null})
                                .sort({pickupTime: 1, deadline: 1})
                                .populate('requester', '-password -stripeId -stripePublishableKey -stripeEmail -verificationToken -dorm -avgShippingRating') //exclude sensitive information
                                .lean().exec(function(err, deliveryItems) {
                                    callback(err, requestItems, deliveryItems);
                                });
                        }
                    })
            }
        });
};

/**
 * Searches for all relevant pending deliveries
 * @param {ObjectId} userID - returned list will NOT include requests made by this user
 * @param {Date} dueAfter - only return deliveries whose deadline is after this date
 * @param {String[]} storesList - only search for deliveries from these stores. If null/undefined/empty, this criteria will not be used.
 * @param {String[]} pickupLocationList - only search for deliveries for these pickup locations. If null/undefined/empty, this criteria will not be used.
 * @param {Integer} minRating - only search for deliveries where the requester has a rating above or equal to minRating. If null/undefined/empty, this criteria will not be used.
 * @param {[String, Number]} sortBy - A list with 2 parameters: first one is the field to sort the return list by, and the second
                                      indicates whether to sort by increasing order (1) or decreasing order (-1). If either parameter is
                                      null/undefined/empty, returned list will not be sorted
 * @param {Function} callback - The callback to execute after the lists are returned. Executed as callback(err, requestItems)
 */
DeliverySchema.statics.getRequests = function(userID, dueAfter, storesList, pickupLocationList, minRating, sortBy, callback) {
    var now = new Date();
    var Model = this;
    User.findOne({_id: userID}, function(err, currentUser) {
        if (currentUser === null) {
            err = new Error("User not found");
        } else if (currentUser.suspendedUntil > now) {
            err = new Error("User has been suspended from making deliveries");
            err.suspendedUntil = currentUser.suspendedUntil;
        }
        if (err) {
            callback(err, null);
        } else {
            var userShippingRating = currentUser.avgShippingRating;
            if (!storesList) {
                storesList = utils.allStores();
            }
            if (!pickupLocationList) {
                pickupLocationList = utils.allPickupLocations();
            }
            if (!minRating) {
                minRating = 1;
            }
            if (sortBy instanceof Array && sortBy[0] && sortBy[1]) { //If all sortBy fields are properly defined, sorts requests accordingly
                Model.find({requester: {$ne: userID},
                           status: "pending",
                           deadline: {$gt: dueAfter},
                           stores: {$in: storesList},
                           pickupLocation: {$in: pickupLocationList},
                           minShippingRating: {$lte: userShippingRating}})
                    .sort({[sortBy[0]]: sortBy[1]})
                    .limit(400) //limit total number of returned requests
                    .populate({path: 'requester',
                               match: {avgRequestRating: {$gte: minRating}}, //populates requester info only if the requester has an average requester rating above the minimum
                               select: '-password -stripeId -stripePublishableKey -stripeEmail -verificationToken -dorm -phoneNumber -avgShippingRating'}) //exclude sensitive information
                    .lean().exec(function(err, requestItems) {
                        requestItems = requestItems.filter(function(item) { //filter out those requests where requester info was not populated
                            return item.requester;
                        });
                        callback(err, requestItems);
                    });  
            } else { //otherwise no need to sort requests
                Model.find({requester: {$ne: userID},
                           status: "pending",
                           deadline: {$gt: dueAfter},
                           stores: {$in: storesList},
                           pickupLocation: {$in: pickupLocationList},
                           minShippingRating: {$lte: userShippingRating}})
                    .populate({path: 'requester',
                               match: {avgRequestRating: {$gte: minRating}}, //populates requester info only if the requester has an average requester rating above the minimum
                               select: '-password -stripeId -stripePublishableKey -stripeEmail -verificationToken -dorm -phoneNumber -avgShippingRating'}) //exclude sensitive information
                    .limit(400) //limit total number of returned requests
                    .lean().exec(function(err, requestItems) {
                        requestItems = requestItems.filter(function(item) { //filter out those requests where requester info was not populated
                            return item.requester;
                        });
                        callback(err, requestItems);
                    });
            }
        }
    });
};

var DeliveryModel = mongoose.model("Delivery", DeliverySchema);

module.exports = DeliveryModel;
