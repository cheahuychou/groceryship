var mongoose = require("mongoose");
var Delivery = require("delivery");
var ObjectId = mongoose.Schema.Types.ObjectId;

var UserSchema = mongoose.Schema({
    username: {type: String, required: true, index: true}, // username must be kerberos
    password: {type: String, required: true}, // should be just the hash
    mitId: {type: Number, required: true},
    phoneNumber: {type: Number, required: true},
    dorm: {type: String, required: true},
    requesterRating: {type: [{type: ObjectId, ref: "rating"}], default: null},
    shopperRating: {type: [{type: ObjectId, ref: "rating"}], default: null}
});

UserSchema.path("username").validate(function(value) {
    return value.trim().length > 0;
}, "No empty kerberos.");

UserSchema.path("password").validate(function(value) {
    return value.trim().length > 0;
}, "No empty passwords.");

UserSchema.path("requesterRating").validate(function(ratings){
		return ratings.reduce(function(boolean, rating){
				return boolean && Delivery.findById(rating.delivery, function (err, delivery){
						delivery.requester.equals(this._id);
				});
		}, true);
}, "User must be the requester.");

UserSchema.path("shopperRating").validate(function(ratings){
		return ratings.reduce(function(boolean, rating){
				return boolean && Delivery.findById(rating.delivery, function (err, delivery){
						delivery.shopper.equals(this._id);
				});
		}, true);
}, "User must be the shopper.");

var UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;