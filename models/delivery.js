//Author: Joseph Kuan
var mongoose = require("mongoose");
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
    return value >= 0;
}, "Estimated Price cannot be negative");

DeliverySchema.path("tips").validate(function(value) {
    return value >= 0;
}, "Tips cannot be negative");

DeliverySchema.path("actualPrice").validate(function(value) {
    return value >= 0;
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
 * Marks an expired pending request as seen that it is expired.
 * @param {Function} callback - The function to execute after request is marked as seenExpired = true. Callback
 * function takes 1 parameter: an error when the operation is not properly executed
 */
DeliverySchema.methods.seeExpired = function(callback) {
    this.seenExpired = true;
    this.save(callback);
};

/**
 * Claims a pending request. Feeds an error into the callback if the request has already been claimed.
 * @param {ObjectId} shopperID - The id of the shopper that is claiming the request
 * @param {Function} callback - The function to execute after request is claimed. Callback
 * function takes 1 parameter: an error when the request is not properly claimed
 */
DeliverySchema.methods.claim = function(shopperID, callback) {
    if (this.status !== "pending") {
        callback(new Error("request has already been claimed"));
    } else {
        this.status = "claimed";
        this.shopper = shopperID;
        this.save(callback);
    }
};

/**
 * "Delivers" a claimed request, assigning the delivery a pickupTime and an actualPrice
 * @param {Date} pickupTime - The pickup time of the delivery
 * @param {Number} actualPrice - The actual price of the good
 * @param {Function} callback - The function to execute after request is delivered. Callback
 * function takes 1 parameter: an error when the delivery is not properly saved
 */
DeliverySchema.methods.deliver = function(pickupTime, actualPrice, callback) {
    this.pickupTime = pickupTime;
    this.actualPrice = actualPrice;
    this.save(callback);
};

/**
 * Accepts a claimed request. Feeds an error into the callback if the request is not in claimed stage
 * @param {Function} callback - The function to execute after request is accepted. Callback
 * function takes 1 parameter: an error when the accept is not properly saved
 */
DeliverySchema.methods.accept = function(callback) {
    if (this.status !== "claimed") {
        callback(new Error("request is either pending or is already accepted/rejected"));
    } else {
        this.status = "accepted";
        this.save(callback);
    }
};

/**
 * Rejects a claimed request. Feeds an error into the callback if the request is not in claimed stage
 * @param {Function} callback - The function to execute after request is rejected. Callback
 * function takes 1 parameter: an error when the reject is not properly saved
 */
DeliverySchema.methods.reject = function(callback) {
    if (this.status !== "claimed") {
        callback(new Error("request is either pending or is already accepted/rejected"));
    } else {
        this.status = "rejected";
        this.save(callback);
    }
};

/**
 * Searches for a user's relevant requests and deliveries to be displayed on dashboard, and returns it.
 * Returned requests of user include:
 *    - requests that are pending, except those where seenExpired = true (where user already knows they are expired)
 *    - all claimed requests
 * Returned deliveries of user include:
 *    - all deliveries except those where the user has already rated the requester
 * @param {ObjectId} userID - The id of the relevant user
 * @param {Function} callback - The callback to execute after the lists are returned. Executed as callback(err, requestItems, deliveryItems)
 */
DeliverySchema.statics.getRequestsAndDeliveries = function(userID, callback) {
    this.find({requester: userID, $or: [{status: "pending", seenExpired: false}, {status: "claimed"}]})
        .populate('shopper').lean().exec(function(err, requestItems) {
            if (err) {
                callback(err, requestItems, null);
            } else {
                mongoose.model('Delivery', DeliverySchema)
                    .find({shopper: userID, requesterRating: null})
                    .populate('requester').lean().exec(function(err, deliveryItems) {
                        callback(err, requestItems, deliveryItems);
                    });
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
    if (!storesList) {
        storesList = utils.allStores();
    }
    if (!pickupLocationList) {
        pickupLocationList = utils.allPickupLocations();
    }
    if (!minRating) {
        minRating = 1;
    }
    if (sortBy instanceof Array && sortBy[0] && sortBy[1]) {
        this.find({requester: {$ne: userID}, status: "pending", deadline: {$gt: dueAfter}, stores: {$in: storesList}, pickupLocation: {$in: pickupLocationList}})
            .sort({[sortBy[0]]: sortBy[1]})
            .populate({path: 'requester', match: {avgRequestRating: {$gte: minRating}}})
            .lean().exec(function(err, requestItems) {
                requestItems = requestItems.filter(function(item) {
                    return item.requester;
                });
                callback(err, requestItems);
            });  
        } else {
        this.find({requester: {$ne: userID}, status: "pending", deadline: {$gt: dueAfter}, stores: {$in: storesList}, pickupLocation: {$in: pickupLocationList}})
            .populate({path: 'requester', match: {avgRequestRating: {$gte: minRating}}})
            .lean().exec(function(err, requestItems) {
                requestItems = requestItems.filter(function(item) {
                    return item.requester;
                });
                callback(err, requestItems);
            });
        }
};

var DeliveryModel = mongoose.model("Delivery", DeliverySchema);

module.exports = DeliveryModel;
