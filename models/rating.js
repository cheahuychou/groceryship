var mongoose = require("mongoose");
var Delivery = require("../models/delivery.js");
var ObjectId = mongoose.Schema.Types.ObjectId;

var RatingSchema = mongoose.Schema({
	delivery: {type: ObjectId, ref: "Delivery", required: true},
	requesterRating: {type: Number, default: null},
	shopperRating: {type: Number, default: null},
	rejectedReason: {type: String, required: false}
});

RatingSchema.path("rejectedReason").validate(function(reason) {
    return reason.trim().length > 0;
}, "A rejection reason cannot be an empty string.");

var RatingModel = mongoose.model("Rating", RatingSchema);

module.exports = RatingModel;
