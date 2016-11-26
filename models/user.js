var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;
var utils = require("../public/javascripts/utils.js");

var UserSchema = mongoose.Schema({
    username: {type: String, required: true, index: true}, // username must be kerberos
    password: {type: String, required: true}, // should be just the hash
    mitId: {type: Number, required: true},
    phoneNumber: {type: Number, required: true},
    dorm: {type: String, required: true},
    requesterRatings: {type: [{type: ObjectId, ref: "rating"}], default: []},
    shopperRatings: {type: [{type: ObjectId, ref: "rating"}], default: []},
    verified: {type:Boolean, default: false},
    verificationToken: {type:String, default: null}

});

UserSchema.methods.verify = function (callback) {
    this.verified = true;
    this.save(callback);
}

UserSchema.statics.verifyAccount = function(kerberos, token, callback) {
    this.findOne({username: kerberos}, function (err, user) {
        if (err) {
            callback({success:false, message: 'Invalid kerberos'});
        } else if (user.verified) {
            callback({success:false, message: 'The account is already verified, please log in below:'});
        } else if (user.verificationToken !== token) {
            callback({success:false, message: 'Invalid verification token'});
        } else {
            user.verify(callback);
        }
    });
};

UserSchema.methods.setVerificationToken = function (token, callback) {
    this.verificationToken = token;
    this.save(callback);
}


UserSchema.path("username").validate(function(username) {
    return username.trim().length > 0;
}, "No empty kerberos.");

UserSchema.path("password").validate(function(password) {
    return password.trim().length > 0;
}, "No empty passwords.");


UserSchema.path("mitId").validate(function(value) {
    return value.toString().length <= 9; //An MIT ID with leading zeros would be represented by a number with less than 9 digits (leading 0s are omitted)
}, "MIT ID must have exactly 9 digits");

UserSchema.path("phoneNumber").validate(function(phoneNumber) {
    return phoneNumber.toString().length === 10;
}, "US phone numbers must have exactly 10 digits");

UserSchema.path("dorm").validate(function(dorm) {
    var dorms = utils.allDorms();
    return dorm.trim().length > 0 && dorms.indexOf(dorm) > -1;
}, "Not a valid dorm name");

UserSchema.path("verificationToken").validate(function(verificationToken) {
    if (!this.verificationToken) {
        return true
    }
    return this.verificationToken.length == utils.numTokenDigits();
}, "Verifacation token must have the correct number of digits");

var UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
