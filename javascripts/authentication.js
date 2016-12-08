var request = require('request');
var config = require('./config.js');
var bcrypt = require('bcrypt');
var utils = require('./utils.js');

var Authentication = function() {

	var that = Object.create(Authentication.prototype);

	/**
    * Checks if the request has a defined session and correct authentication
    * @param {Object} req - request to check for authentication
    * @param {Object} res - response from the previous function
    * @param {Function} next - callback function
    * @return {Boolean} true if the request has the authenication, false otherwise
    */
    that.isAuthenticated = function (req, res, next) {
        if (req.params.username == undefined && req.isAuthenticated() || 
                req.isAuthenticated() && req.params.username === req.session.passport.user.username) {
            // if the request is not user specific, give permission as long as the user is authenticated,
            // otherwise, needs to check that user is requesting for himself
                next();
        } else if (req.isAuthenticated()) {
            res.redirect('/users/'+req.session.passport.user.username);
        } else {
            res.render('home', { title: 'GroceryShip', message: 'Please log in below', allDorms: utils.allDorms(), csrfToken: req.csrfToken()});
        }
    }

    /*
    * Encrypts the password using hashing and salting
    * @param {String} password - the password to encrypt
    * @param  {Function} callback - the function that takes in an object and is called once this function is done
    */
    that.encryptPassword = function (password, callback) {
    	bcrypt.genSalt(function(err, salt) {
            if (err) {
                return callback(err);
            } else {
            	bcrypt.hash(password, salt, function(err, hash) {
                    if (err) {
                        return callback(err);
                    } else {
                    	return callback(err, hash);
                    }
                });
            }
        });
    }

    /*
    * Creates a JSON object whose fields are username, hashed password, first name, last name, phone number, dorm
    * @param {String} username - the username for the user, must be a kerberos
    * @param {String} password - the user's password
    * @param {Integer} phoneNumber - the user's phone number
    * @param {String} dorm - the dorm the user lives in
    * @param {Object} mitData - the data about the user that is returned by MIT People API
    * @param  {Function} callback - the function that takes in an object and is called once this function is done
    */
    that.createUserJSON = function (username, password, phoneNumber, dorm, mitData, callback) {
        if (password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(password)) {
            callback({success: false, message: "A valid password contains at least 8 characters, and at least one uppercase character, one lowercase character, a number and one special character."})
        } else {
            that.encryptPassword(password, function (err, hash) {
                if (err) {
                    return callback(err);
                } else {
                    var firstName = mitData.person ? mitData.person.givenName : 'FirstNameTest';
                    var lastName = mitData.person ? mitData.person.familyName : 'LastNameTest';
                    var user = {username: username,
                            password: hash,
                            firstName: firstName,
                            lastName: lastName,
                            phoneNumber: phoneNumber,
                            dorm: dorm};
                    callback(null, user);
                }      
            });
        }
    }

    /**
    * Queries the MIT People directory based on the kerberos
    * and gets the information for the person with that kerberos.
    *
    * If the query is not successful (network error, wrong client id or secret, no authorization, etc),
    * success is false. success is true otherwise.
    * If success is false, message is the message describing the error.
    * If success is true, isValidKerberos specifies whether kerberos was found in the MIT People directory or not.
    * An Object with the fields, success, message (optional for success==true), and isValidKerberos (when success is true)
    * is passed into the callback function.
    *
    * @param  {String}   kerberos a kerberos
    * @param  {Function} callback a callback function that takes in an object and is called once this function is done
    */
    that.getMitInfo = function(kerberos, callback) {
        var CLIENT_ID = process.env.MIT_PEOPLE_CLIENT_ID || config.mitPeopleClientId();
        var CLIENT_SECRET = process.env.MIT_PEOPLE_CLIENT_SECRET || config.mitPeopleClientSecret();
        var options = {
            url: 'https://mit-public.cloudhub.io/people/v3/people/'+kerberos,
            headers: {
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET
            }
        };
        request(options, function(err, response, body) {
            var result = JSON.parse(body);
            if (err) {
                console.log(err);
                callback({success: false, message: 'Couldn\'t send GET request to MIT People directory'});
            } else if (result.errorCode) {
                console.log('error: ', body);
                if (result.errorCode == 400) {
                    // this error code means that the kerberos is not valid
                    callback({success: true, isValidKerberos: false});
                } else { // error is in the request made and not on the kerberos
                    // handle other error codes
                    // if you want to handle other error codes in a different way,
                    // the documentation of API specifies what the other error codes are
                    var completeError = result.errorMessage + '. ' + result.errorDetails.message;
                    console.log(completeError);
                    callback({success: false, message: completeError});
                }
            } else {
                console.log('success');
                callback({success: true, isValidKerberos: true, person: result.item});
            }
        });
    }

	Object.freeze(that);
    return that;
};

module.exports = Authentication();
