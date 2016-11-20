var mongoose = require("mongoose");
var utils = require("../public/javascripts/utils.js")
var ObjectId = mongoose.Schema.Types.ObjectId;

var DeliverySchema = mongoose.Schema({
    stores: [{type: String, required: true}], // A list of possible grocery stores.
    status: {type: String, required: true},
    deadline: {type: Date, required: true},
    itemName: {type: String, required: true},
    itemDescription: {type: String, required: true},
    itemQuantity: {type: Number, required: true},
    estimatedPrice: {type: Number, required: true},
    tips: {type: Number, required: true},
    pickupLocation: {type: String, required: true},
    requester: {type: ObjectId, ref: "User", required: true},
    shopper: {type: ObjectId, ref: "User"},
    actualPrice: Number,
    pickupTime: Date
}); 

DeliverySchema.path("stores").validate(function(stores) {
		utils.each(stores, function(store) {
			if (!(store == "hMart" || store == "starMarket" || store == "traderJoes" || store == "wholeFoods")){
				return false
			} 
			return true
		});
}, "Not a valid grocery store");

DeliverySchema.path("status").validate(function(status) {
    return status == "pending" || status == "claimed" || status == "rejected" || status == "accepted";
}, "Not a valid status");


var DeliveryModel = mongoose.model("Delivery", DeliverySchema);

module.exports = DeliveryModel;