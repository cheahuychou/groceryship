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
    verificationToken: {type:String, default: null},
    suspendedUntil: {type: Date, required: false} // The date where a user is suspended until (if his average shipping rating is too low)
});


UserSchema.path("username").validate(function(username) {
    return username.trim().length > 0;
}, "No empty kerberos.");

UserSchema.path("password").validate(function(password) {
    return password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(password);
}, "A valid password contains at least 8 characters, and at least one uppercase character, one lowercase character, a number and one special character.'");

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


/**
* Sets a verification token for the user
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
            callback({success:false, isVerified: true, message: 'The account is already verified, please log in below:'});
        } else if (user.verificationToken !== token) {
            callback({success:false, message: 'Invalid verification token'});
        } else {
            user.verify(callback);
        }
    });
};

/*
* Checks if the provided username and password correspond to any user
* @param {String} username - username of the account to grant authentication
* @param {String} password - password of the account to grant authentication 
* @param {Function} callback - the function that gets called after the check is done, err argument
*                              is null if the given username and password are valid, otherwise,
*                              err.message contains the appropriate message to show to the user
*/
UserSchema.statics.authenticate = function (username, password, callback) {
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

/*
* Registers a new user with the given userJSON (only if there is no user
* with the given username)
* @param {Object} userJSON - json object containing the appropriate fields
* @param {Boolean} devMode - true if the app is in developer mode, false otherwise
* @param {Function} callback - the function that gets called after the user is created, err argument
*                              is null if the given the registration succeed, otherwise, err.message
*                              contains the appropriate message to show to the user
*/
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
        } else {
            callback({message: 'There is already an account with this kerberos'});
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
    this.avgRequestRating = (this.avgRequestRating * (newLength - 1) + rating) / newLength;
    this.save(callback);
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
    var oldRating = this.avgShippingRating;
    this.avgShippingRating = (this.avgShippingRating * (newLength - 1) + rating) / newLength;

    //Suspend users for a period of time if they
    //    1. previously had a good average rating but rating now fell below minimum allowed ship rating
    //    2. currently have a bad average rating & receive another bad rating
    if (newLength >= 4) { //only suspend users who have made 4 or more deliveries so you have a sufficient sample size
        if ((oldRating >= utils.minAllowedShipRating() && this.avgShippingRating < utils.minAllowedShipRating())
            || (oldRating < utils.minAllowedShipRating() && rating < utils.minAllowedShipRating())) {
            var now = Date.now();
            this.suspendedUntil = new Date(now + utils.suspensionPeriod());
        }
    }

    this.save(callback);
};

var UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
