// Author: Cheahuychou Mao

var dateFormat = require('dateformat');
var request = require('request');
var config = require('./config.js');

var Utils = function() {

    var that = Object.create(Utils.prototype);

    /**
    * @return {Array} the list of all dorms in MIT that a user can register himself under
    */
    that.allDorms = function() {
        return ['Baker', 'Burton Conner', 'East Campus', 'MacGregor', 'Maseeh',
                'McCormick', 'New House', 'Next House', 'Random', 'Senior',
                'Simmons'];
    };

    /**
    * @return {Array} the list of all pickup locations which a user can request goods to be delivered to
    */
    that.allPickupLocations = function() {
        return ['Maseeh', 'McCormick', 'Baker', 'Burton Conner', 'MacGregor', 'New House', 'Next House',
                    'East Campus', 'Senior', 'Random', 'Simmons', 'Lobby 7', 'Lobby 10', 'Stata'];
    };

    /**
    * @return {Array} the list of all stores which users can request goods from
    */
    that.allStores = function() {
        return ["HMart", "Star Market", "Trader Joe's", "Whole Foods"];
    };

    /**
    * @return {Integer} the number of digits in verification token
    */
    that.numTokenDigits = function () {
        return 32;
    }

    /**
    * Reverse the given array (not in place)
    * @param {Array} array - array to reverse
    * @return {Array} a new reversed array 
    */
    that.reverseArray = function (array) {
        var reversed_array = [];
        reversed_array = reversed_array.concat(array);
        reversed_array.reverse();
        return reversed_array;
    }

    // taken from lectures
    var from_to = function (from, to, f) {
        if (from > to) return;
        f(from); from_to(from+1, to, f);
    }

    // taken from lecture
    that.each = function (a, f) {
        from_to(0, a.length-1, function (i) {f(a[i]);});
    }

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
            res.render('home', { title: 'GroceryShip', message: 'Please log in below'});
        }
    }


    /**
    * Reformat the deadline of each delivery
    * @param {Array} deliveries - array of delivery objects
    * @return {Array} a new array of delivery objects with deadline formatted
    */
    that.formatDate = function (deliveries) {
        var deliveries = JSON.parse(JSON.stringify(deliveries)); // deep copy
        return deliveries.map(function (delivery) {
                    delivery.deadline = dateFormat(delivery.deadline, "mmmm dS, h:MM TT");
                    if (delivery.pickupTime) {
                        delivery.rawPickupTime = new Date(delivery.pickupTime);
                        delivery.pickupTime = dateFormat(delivery.pickupTime, "mmmm dS, h:MM TT");
                    }
                    return delivery;
               });
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
                } else { // error is in the request made an not on the kerberos
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

module.exports = Utils();
