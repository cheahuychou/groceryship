var mongoose = require("mongoose");
var utils = require("../public/javascripts/utils.js")
var ObjectId = mongoose.Schema.Types.ObjectId;

var DeliverySchema = mongoose.Schema({
    stores: [{type: String, required: true}], // A list of possible grocery stores.
    status: {type: String, required: true},
    deadline: {type: String, required: true},
    itemName: {type: String, required: true},
    itemDescription: {type: String, required: true},
    itemQuantity: {type: Number, required: true},
    estimatedPrice: {type: Number, required: true},
    tips: {type: Number, required: true},
    pickupLocation: {type: String, required: true},
    requester: {type: ObjectId, ref: "User", required: true},
    shopper: {type: ObjectId, ref: "User", default: null},
    actualPrice: {type: Number, default: null},
    pickupTime: {type: String, default: null}
}); 

DeliverySchema.path("stores").validate(function(stores) {
		utils.each(stores, function(store) {
			if (!(store == "HMart" || store == "Star Market" || store == "Trader Joe's" || store == "Whole Foods")) {return false;}
		});
        return true;
}, "Not a valid grocery store");

DeliverySchema.path("status").validate(function(status) {
    return status == "pending" || status == "claimed" || status == "rejected" || status == "accepted";
}, "Not a valid status");

DeliverySchema.path("shopper").validate(function(shopperId) {
	return shopperId != this.requester;
}, "The shopper and the requester should not be the same.");

DeliverySchema.path("pickupTime").validate(function(pickupTime) {
    return (!pickupTime || new Date(this.deadline) >= new Date(pickupTime));
}, "The dealine has passed.");

DeliverySchema.path("deadline").validate(function(deadline) {
	return new Date(deadline) >= new Date();
}, "The dealine must be after the current time.");

var DeliveryModel = mongoose.model("Delivery", DeliverySchema);

module.exports = DeliveryModel;