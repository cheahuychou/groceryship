var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

var UserSchema = mongoose.Schema({
    username: {type: String, required: true, index: true}, // username must be kerberos
    password: {type: String, required: true}, // should be just the hash
    mitId: {type: Number, required: true},
    phoneNumber: {type: Number, required: true},
    dorm: {type: String, required: true},
    stripeId: {type: String, equired: true},
    requesterRatings: {type: [{type: ObjectId, ref: "rating"}], default: []},
    shopperRatings: {type: [{type: ObjectId, ref: "rating"}], default: []}
});

UserSchema.path("username").validate(function(value) {
    return value.trim().length > 0;
}, "No empty kerberos.");

UserSchema.path("password").validate(function(value) {
    return value.trim().length > 0;
}, "No empty passwords.");

UserSchema.path("mitId").validate(function(value) {
    return value.toString().length === 9;
}, "MIT ID must have exactly 9 digits");

UserSchema.path("phoneNumber").validate(function(value) {
    return value.toString().length === 10;
}, "US phone numbers must have exactly 10 digits");

UserSchema.path("dorm").validate(function(value) {
    var dorms = ['Baker', 'Burton Conner', 'East Campus', 'MacGregor', 'Maseeh',
                    'McCormick', 'New House', 'Next House', 'Random', 'Senior',
                    'Simmons']
    return value.trim().length > 0 && dorms.indexOf(value) > -1;
}, "Not a valid dorm name");

/**
 * Connect a stripe ID to . Feeds an error into the callback if the request has already been claimed.
 * @param {String} stripeId - The stripe id of the user. 
 * @param {Function} callback - The function to execute after the account is connected. Callback
 * function takes 1 parameter: an error when the request is not properly claimed
 */
UserSchema.methods.connect = function(stripeId, callback) {
    this.stripeId = stripeId;
    this.save(callback);
};

var UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
