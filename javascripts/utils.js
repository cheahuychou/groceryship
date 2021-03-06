// Author: Cheahuychou Mao

var dateFormat = require('dateformat');

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
        return that.allDorms().concat(['Lobby 7', 'Lobby 10', 'Stata']);
    };

    /**
    * @return {Array} the list of all stores which users can request goods from
    */
    that.allStores = function() {
        return ["HMart", "Star Market", "Trader Joe's", "Whole Foods"];
    };

    /**
    * @return {Number} The minimum allowed average shipping rating for users, below which the user will be suspended for a period of time
    */
    that.minAllowedShipRating = function() {
        return 3;
    };

    /**
    * @return {Integer} The length of time (in milliseconds) that a user will be suspended for, if he falls below the minimum rating
    */
    that.suspensionPeriod = function() {
        return 1000*60*60*24*30; //30 days
    };

    /**
     * @return {Integer} The minimum number of deliveries made by a user before he/she can be suspended.
     */
    that.minDeliveriesForSuspension = function() {
        return 4;
    }

    /**
    * @return {Integer} the number of digits in verification token
    */
    that.numTokenDigits = function () {
        return 32;
    };

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
    };

    // taken from lectures
    var from_to = function (from, to, f) {
        if (from > to) return;
        f(from); from_to(from+1, to, f);
    };

    // taken from lecture
    that.each = function (a, f) {
        from_to(0, a.length-1, function (i) {f(a[i]);});
    };

    /**
    * Reformat the deadline of each delivery
    * @param {Array} deliveries - array of delivery objects
    * @return {Array} a new array of delivery objects with deadline formatted
    */
    that.formatDate = function (deliveries) {
        var deliveries = JSON.parse(JSON.stringify(deliveries)); // deep copy
        return deliveries.map(function (delivery) {
            delivery.rawDeadline = (new Date(delivery.deadline)).getTime();
            delivery.deadline = dateFormat(delivery.deadline, "mmm d, h:MM TT");
            if (delivery.pickupTime) {
                delivery.rawPickupTime = (new Date(delivery.pickupTime)).getTime();
                delivery.pickupTime = dateFormat(delivery.pickupTime, "mmm d, h:MM TT");
            }
            return delivery;
        });
    };

    /**
     * Checks if number is an integer from from to to.
     * @param  {Integer}  number the number to check
     * @param  {Integer}  from   the minimum integer value for number
     * @param  {Integer}  to     the maximum integer value for number
     * @return {Boolean}         true if number is an integer from from to to; false otherwise
     */
    var isFromToInt = function(number, from, to) {
        return Number.isInteger(number) && number >= from && number <= to;
    };

    /**
     * Checks if rating is a valid rating
     * @param  {Integer}  rating the rating to be checked
     * @return {Boolean}         true if rating is a valid rating; false otherwise
     */
    that.isValidRating = function(rating) {
        var minRating = 1;
        var maxRating = 5;
        return rating === null || isFromToInt(rating, minRating, maxRating);
    };

    Object.freeze(that);
    return that;
};

module.exports = Utils();
