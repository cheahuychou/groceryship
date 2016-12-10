// Author: Czarina Lao

/**
 * Adds the message message to the area with id messages or class modal-messages.
 * @param {String}  message  The message
 * @param {String}  type     The type of message: success, warning, info, or danger
 * @param {Boolean} isModal  if true, adds the message to modal-messages instead of messages
 * @param {Boolean} clearOld if true, clears old messages
 */
var addMessage = function(message, type, isModal, clearOld) {
    var divSelector = isModal ? '.modal-messages' : '#messages';
    if (clearOld) $(divSelector).empty();
    var messageDiv = $('<div/>');
    messageDiv.addClass('alert alert-dismissible alert-'+type);
    messageDiv.attr('role', 'alert');
    messageDiv.text(message);
    // dismiss button. code from bootstrap
    messageDiv.append('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
    $(messageDiv).appendTo($(divSelector)).hide().slideDown("slow");
};

/**
 * Check that the price given by priceString is valid.
 * Accepts prices with more than 2 decimal points but rounds it to 2.
 * @param  {String}  priceString the price being checked
 * @param  {Boolean} isZeroOk    true if price >=0; false if price > 0
 * @return {Float/Boolean}       the price rounded to 2 decimal places if the price is valid;
 *                                  false otherwise
 */
var checkPriceFormat = function(priceString, isZeroOk) {
    var price = parseFloat(priceString).toFixed(2);
    if (isNaN(price) || price < 0 || (!isZeroOk && price == 0)) return false;
    return price;
};

/**
 * Adds a 'has-error' class to the parent element of a price
 * if it's not valid (negative/nonnnegative or not a number).
 * Accepts prices with more than 2 decimal points but rounds it to 2.
 * Removes the 'has-error' class if it exists on a valid price.
 * @param  {Object}   element the element containing the price
 * @param  {Boolean}  true if we want price >=0; false if price > 0
 */
var showPriceFormatErrors = function(element, isZeroOk) {
    var price = checkPriceFormat($(element).val(), isZeroOk);
    if (price) {
        $(element).val(price);
        $(element).parent().removeClass('has-error');
    } else if (!$(element).parent().hasClass('has-error')) {
        $(element).parent().addClass('has-error');
    }
}

/**
 * Sets the min and max date for the datetime picker
 * where min date is today
 * @param {String} deadline - the string for the deadline in the format returned
 *                            "mmmm dS, h:MM TT"
 */
var setMinMaxDateTime = function (deadline) {
    // TODO: currently the time is set to 0:00:00, however we might want it to be the exactly the current time and exact
    // due time
    var currentTime = new Date();
    var minDateTime = currentTime.getFullYear()  + "-" + numberToJsTimeFormat(currentTime.getMonth()+1) + "-" + numberToJsTimeFormat(currentTime.getDate()) + "T00:00:00"; 
    $('.datetimepicker').each(function () {
        $(this).attr('min', minDateTime);
    });
    if (deadline) {
        var deadlineString = deadline.split(',')[0];
        deadlineString = deadlineString.substring(0, deadlineString.length - 2);
        var dueTime = new Date(Date.parse(deadlineString));
        var maxDateTime = currentTime.getFullYear()  + "-" + numberToJsTimeFormat(dueTime.getMonth()+1) + "-" + numberToJsTimeFormat(dueTime.getDate()) + "T00:00:00";
        $('.datetimepicker').attr('max', maxDateTime);
    }
}

// Adapted from: http://stackoverflow.com/questions/17415579/how-to-iso-8601-format-a-date-with-timezone-offset-in-javascript

/**
 * Returns number as a rounded positive 2-digit string.
 * If number is 1-digit then a 0 is prepended
 * as in the timezone offset format
 * @param  {Float} number  a number for a part of the timezone offset
 * @return {String}        formatted number as defined above
 */
var numberToJsTimeFormat = function(number) {
    var norm = Math.abs(Math.floor(number));
    return (norm < 10 ? '0' : '') + norm;
};

/**
 * Returns the system's timezone offset
 * in the format used by Javascript's Date
 * e.g. '-05:00' for the timezone GMT-5
 * @return {String} timezone offset string
 */
var getFormattedTimezoneOffset = function() {
    // we need to negate this because .getTimezoneOffset is positive if the time is behind and vice versa
    var timezoneOffsetMinutes = -(new Date().getTimezoneOffset());
    var sign = timezoneOffsetMinutes >= 0 ? '+' : '-';
    var hoursOffset = timezoneOffsetMinutes / 60;
    var modMinutesOffset = timezoneOffsetMinutes % 60;

    return sign + numberToJsTimeFormat(hoursOffset) + ':' + numberToJsTimeFormat(modMinutesOffset);
};

/* Removes spaces, dashes and parentheses from the number string
 * @param {String} num_string - number string to clean up
 * @return {String} formatted number string which can be parsed to integer type
*/
var formatNumberString = function (num_string) {
    return num_string.replace(/-|\s|\(|\)/g, '')
} 

