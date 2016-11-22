var mongoose = require("mongoose");
//var utils = require("../public/javascripts/utils.js")
var ObjectId = mongoose.Schema.Types.ObjectId;

var RatingSchema = mongoose.Schema({
	delivery: {type: ObjectId, ref: "Delivery", required: true},
	requesterRating: {type: Number, default: null},
	shopperRating: {type: Number, default: null},
	rejectedReason: {type: String, required: false}
});

var RatingModel = mongoose.model("Rating", RatingSchema);

module.exports = RatingModel;