// Author: Cheahuychou Mao

var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var ObjectId = mongoose.Schema.Types.ObjectId;
var utils = require("../javascripts/utils.js");
var email = require('../javascripts/email.js');
var authentication = require('../javascripts/authentication.js');

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
    return password.trim().length > 0;
}, "No empty passwords");

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
* Changes the phone number to a new one.
* @param {String} phoneNumber - the new phone number.
* @param {Function} callback - the function that gets called after
*/
UserSchema.methods.changePhoneNumber = function(phoneNumber, callback){
    this.phoneNumber = phoneNumber;
    this.save(callback);
}

/**
* Changes the dorm to a new one.
* @param {String} dorm - the new dorm.
* @param {Function} callback - the function that gets called after
*/
UserSchema.methods.changeDorm = function(dorm, callback){
    this.dorm = dorm;
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
        if (err) {
            callback({success: false, message: 'Database error'});
        } else if (count === 0) {
            that.create(userJSON, function(err, user){
                that.sendVerificationEmail(user.username, devMode, callback);
            });
        } else {
            callback({message: 'There is already an account with this kerberos'});
        }
    });
}

/*
* Sends a verification email to the user if there exists an account with such username.
* If devMode is true, send a verification link with localhost prefix, otherwise send the
* production URL prefix
* @param {String} username - username of the user 
* @param {Boolean} devMode - true if the app is in development mode, false otherwise
* @param {Function} callback - the function that gets called after the user is created, err argument
*                              is null if the given the registration succeed, otherwise, err.message
*/
UserSchema.statics.sendVerificationEmail = function (username, devMode, callback) {
    that = this;
    that.count({ username: username }, function (err, count) {
        if (count === 0) {
            callback({message: 'Invalid username'});
        } else {
            that.findOne({username: username}, function (err, user) {
                if (err) {
                    callback(err)
                } else if (user && !user.isVerified) {
                    email.sendVerificationEmail(user, devMode, callback);
                } else {
                    callback({message: 'Your account has already been verified. You can now log in.'});
                }
            });
        }
    });
}

/**
 * Adds a delivery ID to the completed requests field. Updates the average request rating.
 * @param {ObjectId} id - The id of the requester
 * @param {ObjectId} deliveryId - The delivery id of the new completed request. 
 * @param {Number} rating - The rating of the new completed request. 
 * @param {Function} callback - The function to execute after the account is connected. Callback
 * function takes 2 parameters: an error when the change is not properly saved, and the new rating
 */
UserSchema.statics.addCompletedRequest = function(id, deliveryId, rating, callback) {
    this.findOne({_id: id}, function(err, currentUser) {
        if (err) {
            callback(err, null);
        } else {
            currentUser.completedRequests.push(deliveryId);
            var newLength = currentUser.completedRequests.length;
            currentUser.avgRequestRating = (currentUser.avgRequestRating * (newLength - 1) + rating) / newLength;
            currentUser.save(function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, currentUser.avgRequestRating);
                }
            });
        }
    });
}

/**
 * Adds a delivery ID to the completed shippings field. Updates the average shipping rating.
 * @param {ObjectId} id - The id of the shopper
 * @param {ObjectId} deliveryId - The delivery id of the new completed shipping. 
 * @param {Number} rating - The rating of the new completed shipping. 
 * @param {Function} callback - The function to execute after the account is connected. Callback
 * function takes 2 parameters: an error when the change is not properly saved, and the new rating
 */
UserSchema.statics.addCompletedShipping = function(id, deliveryId, rating, callback) {
    this.findOne({_id: id}, function(err, currentUser) {
        if (err) {
            callback(err, null);
        } else {
            currentUser.completedShippings.push(deliveryId);
            var newLength = currentUser.completedShippings.length;
            var oldRating = currentUser.avgShippingRating;
            currentUser.avgShippingRating = (currentUser.avgShippingRating * (newLength - 1) + rating) / newLength; //calculate the new average shipping rating

            //Suspend users for a period of time if they
            //    1. previously had a good average rating but rating now fell below minimum allowed ship rating
            //    2. currently have a bad average rating & receive another bad rating
            if (newLength >= utils.minDeliveriesForSuspension()) { //only suspend users who have made 4 or more deliveries so you have a sufficient sample size
                if ((oldRating >= utils.minAllowedShipRating() && currentUser.avgShippingRating < utils.minAllowedShipRating())
                    || (oldRating < utils.minAllowedShipRating() && rating < utils.minAllowedShipRating())) {
                    var now = Date.now();
                    currentUser.suspendedUntil = new Date(now + utils.suspensionPeriod());
                }
            }

            currentUser.save(function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, currentUser.avgShippingRating);
                }
            });
        }
    });
}

/*
 * Edits the profile of a query user. 
 * @param {String} username - The username of the query user. 
 * @param {Number} newPhoneNumber - The new phone number of the user. 
 * @param {String} newDorm - The new dorm of the user. 
 * @param {Function} callback - The function to execute after the profile is editted. Callback
 * function takes 1 parameter: an error when the request is not properly claimed
 */
UserSchema.statics.editProfile = function(username, newPhoneNumber, newDorm, callback) {
    this.findOne({'username': username}, function(err, user){
        user.changePhoneNumber(newPhoneNumber, function(err){
            if (err) {
                callback(new Error("Invalid phone number."));
            } else {
                user.changeDorm(newDorm, function(err){
                    if (err) {
                        callback(new Error("Invalid dorm."));
                    } else {
                        callback(null);
                    }
                });
            }
        });
    });
}

/*
 * Changes the password of a query user. 
 * @param {String} username - The username of the query user. 
 * @param {String} newPassword - The new password of the user. 
 * @param {Function} callback - The function to execute after the password is changed. Callback
 * function takes 1 parameter: an error when the request is not properly claimed
 */
UserSchema.statics.changePassword = function(username, newPassword, callback){
    this.findOne({username: username}, function (err, user) {
        if (err) {
            callback(new Error("Invalid username."));
        } else {
            authentication.encryptPassword(newPassword, function(err, hash){
                if (err){
                    callback(new Error("The new password is invalid."));
                } else {
                    user.password = hash;
                    user.save(callback); 
                }
            });
        }
    });
}

var UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
