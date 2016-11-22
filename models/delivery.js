var mongoose = require("mongoose");
var utils = require("../public/javascripts/utils.js")
var ObjectId = mongoose.Schema.Types.ObjectId;

var DeliverySchema = mongoose.Schema({
    stores: [{type: String, required: true}], // A list of possible grocery stores.
    status: {type: String, required: true},
    deadline: {type: Date, required: true},
    itemName: {type: String, required: true},
    itemDescription: {type: String, required: true},
    itemQuantity: {type: String, required: true},
    estimatedPrice: {type: Number, required: true},
    tips: {type: Number, required: true},
    pickupLocation: {type: String, required: true},
    requester: {type: ObjectId, ref: "User", required: true},
    shopper: {type: ObjectId, ref: "User", default: null},
    actualPrice: {type: Number, default: null},
    pickupTime: {type: Date, default: null}
}); 

DeliverySchema.path("stores").validate(function(stores) {
    return stores.reduce(function(a, b) {
        return a && (b === "HMart" || b === "Star Market" || b === "Trader Joe's" || b === "Whole Foods");
    }, true);
}, "Not a valid grocery store");

DeliverySchema.path("status").validate(function(status) {
    return status == "pending" || status == "claimed" || status == "rejected" || status == "accepted";
}, "Not a valid status");

DeliverySchema.path("shopper").validate(function(shopperId) {
	return shopperId != this.requester;
}, "The shopper and the requester should not be the same.");

DeliverySchema.path("deadline").validate(function(deadline) {
    return deadline >= this.pickupTime;
}, "The dealine has passed.");

/**
 * Claims a pending request. Feeds an error into the callback if the request has already been claimed.
 * @param {ObjectId} shopperId - The id of the shopper that is claiming the request
 * @param {Function} callback - The function to execute after request is claimed. Callback
 * function takes 1 parameter: an error when the request is not properly claimed
 */
DeliverySchema.methods.claim = function(shopperId, callback) {
    if (this.status !== "pending") {
        callback(new Error("request has already been claimed"));
    } else {
        this.status = "claimed";
        this.shopper = shopperId;
        this.save(callback);
    }
};

/**
 * "Delivers" a pending request, giving the delivery a pickupTime and actualPrice of good
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

var DeliveryModel = mongoose.model("Delivery", DeliverySchema);

module.exports = DeliveryModel;