// Author: Cheahuychou Mao

var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var ObjectId = mongoose.Schema.Types.ObjectId;
var utils = require("../javascripts/utils.js");
var email = require('../javascripts/email.js');

var UserSchema = mongoose.Schema({
    username: {type: String, required: true, index: true}, // username must be kerberos
    password: {type: String, required: true}, // should be just the hash
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    phoneNumber: {type: Number, required: true},
    dorm: {type: String, required: true},
    stripeId: {type: String, required: true},
    stripeEmail: {type: String, required: true},
    completedRequests: {type: [{type: ObjectId, ref: "delivery"}], default: []},
    avgRequestRating: {type: Number, default: 5},
    completedShippings: {type: [{type: ObjectId, ref: "delivery"}], default: []},
    avgShippingRating:  {type:Number, default: 5},
    verified: {type:Boolean, default: false},
    verificationToken: {type:String, default: null}
});

/**
* Set a verification token for the user
* @param {String} token - the 32-digit verification token
* @param {Function} callback - the function that gets called after the token is set
*/
UserSchema.methods.setVerificationToken = function (token, callback) {
    this.verificationToken = token;
    this.save(callback);
}

/**
* Sets verified to true
* @param {Function} callback - the function that gets called after
*/
UserSchema.methods.verify = function (callback) {
    this.verified = true;
    this.save(callback);
}

/**
* Verifies the account so that user can start using it
* @param {String} kerberos - kerberos of the account to verify
* @param {String} token - the 32-digit verification token
* @param {Function} callback - the function that gets called after the account is verified
*/
UserSchema.statics.verifyAccount = function (username, token, callback) {
    this.findOne({username: username}, function (err, user) {
        if (err || (!err & !user)) {
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


UserSchema.statics.logIn = function (username, password, callback) {
    this.findOne({ username: username }, function (err, user) {
        if (err || user == null) {
            callback({message:'Please enter a valid username'});
        } else {
            bcrypt.compare(password, user.password, function (err, response) {
                if (response == true) {
                    callback(null, {username: username,
                                    _id: user._id,
                                    verified: user.verified,
                                    fullName: user.firstName + ' ' + user.lastName});
                } else {
                    callback({message:'Please enter a correct password'});
                }
            });
        }
    }); 
}

UserSchema.statics.signUp = function (userJSON, devMode, callback) {
    that = this;
    that.count({ username: userJSON.username }, function (err, count) {
        if (count === 0) {
            that.create(userJSON, function(err, user){
                if (devMode) {
                    email.sendVerficationEmail(user, true);
                } else {
                    email.sendVerficationEmail(user, false);
                }
                callback(err, user);
            });
        }
    });
}

/**
 * Adds a delivery ID to the completed requests field. Updates the average request rating.  
 * @param {ObjectId} deliveryId - The delivery id of the new completed request. 
 * @param {Number} rating - The rating of the new completed request. 
 * @param {Function} callback - The function to execute after the account is connected. Callback
 * function takes 1 parameter: an error when the request is not properly claimed
 */
UserSchema.methods.addCompletedRequest = function(deliveryId, rating, callback) {
    this.completedRequests.push(deliveryId);
    var newLength = this.completedRequests.length;
    this.avgRequestRating = parseFloat((this.avgRequestRating * (newLength - 1) + rating) / newLength).toFixed(1)
};

/**
 * Adds a delivery ID to the completed shippings field. Updates the average shipping rating.  
 * @param {ObjectId} deliveryId - The delivery id of the new completed request. 
 * @param {Number} rating - The rating of the new completed request. 
 * @param {Function} callback - The function to execute after the account is connected. Callback
 * function takes 1 parameter: an error when the request is not properly claimed
 */
UserSchema.methods.addCompletedShipping = function(deliveryId, rating, callback) {
    this.completedShippings.push(deliveryId);
    var newLength = this.completedShippings.length;
    this.avgShippingRating = parseFloat((this.avgShippingRating * (newLength - 1) + rating) / newLength).toFixed(1)
};

UserSchema.path("username").validate(function(username) {
    return username.trim().length > 0;
}, "No empty kerberos.");

UserSchema.path("password").validate(function(password) {
    return password.trim().length > 0;
}, "No empty passwords.");

UserSchema.path("firstName").validate(function(firstName) {
    return firstName.trim().length > 0;
}, "No empty first names.");

UserSchema.path("lastName").validate(function(lastName) {
    return lastName.trim().length > 0;
}, "No empty last names.");

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
}, "Verification token must have the correct number of digits");

var UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
