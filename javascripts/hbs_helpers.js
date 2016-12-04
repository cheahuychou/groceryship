var HbsHelpers = function() {
	var that = Object.create(HbsHelpers.prototype);

    /**
     * Measures if a certain time A has already passed another time B
     * @param {Date} timeA - The first time A
     * @param {Date} timeB - The second time B
     * @param {Object} options - The handlebars options hash
     */
	that.ifIsPast = function(timeA, timeB, options) {
        if (timeB >= timeA) {
            return options.fn(this);
        }
        return options.inverse(this);
    }

    /**
     * Adds 2 numbers
     * @param {Number} a - The first number
     * @param {Number} b - The second number
     * @return {Number} The sum of a and b
     */
    that.add = function(a, b) {
        return a+b;
    }

    /**
     * If input parameter 'a' is an array, test if 'b' is an element of that array 'a'. Otherwise test if 'a' and 'b' are equal.
     * @param {*} a - Either an array or a single object
     * @param {*} b - The element to be tested
     * @param {Object} options - The handlebars options hash
     */
    that.ifContains = function(a, b, options) {
        if (a instanceof Array) {
            if (a.indexOf(b) > -1) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        } else {
            if (a === b) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        }
    }

    /**
     * Rounds a number off to the desired number of decimal places
     * @param {String|Number} number - The number to be rounded off
     * @param {Integer} precision - The number of decimal places to round the number to (precision 0 rounds to an integer, precision 1 rounds to e.g. 111.1). Must be non-negative.
     * @return {Number} The rounded off number
     */
    that.roundOff = function(number, precision) {
        return parseFloat(number).toFixed(precision);
    }

    /**
     * Formats the phone number in the format xxx-xxx-xxxx
     * @param  {String} phoneNumber a 10-digit US phone number
     * @return {String}             a formatted phoneNumber
     */
    that.formatPhone = function(phoneNumber) {
        var phoneString = String(phoneNumber);
        return phoneString.substr(0,3) + '-' + phoneString.substr(3,3) + '-' + phoneString.substr(6,4);
    }

	Object.freeze(that);
    return that;
};

module.exports = HbsHelpers();
