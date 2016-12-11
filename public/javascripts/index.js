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
 * Shows an error on the element/s given by selector.
 * @param  {String} selector used to select elements that have an error
 */
var showError = function(selector) {
    if (!$(selector).parent().hasClass('has-error')) {
        $(selector).parent().addClass('has-error');
    }
}

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
    } else {
        showError(element);
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
};

/**
 * Looks for scripting tags from text.
 * This can be used to prevent XSS
 * @param  {String} text  the text to be tested
 * @return {Boolean}      true if scripting tags exist in text; false otherwise
 */
var findScriptingTags = function(text) {
    return /<[a-z][\s\S]*>/i.test(text);
};

/**
 * Tests the strength of password.
 * A strong password contains 8 or more characters,
 * has at least 1 lowercase character, 1 uppercase character,
 * 1 digit and 1 special symbol from !,@,#,$,%,^,&,*.
 * @param  {String} password  the password to be tested
 * @return {Boolean}          true if the password is strong enough; false otherwise
 */
var testPasswordStrength = function(password) {
    // regex taken from https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
    return password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(password);
};

/**
 * Checks if phoneNumber is a valid US phone number.
 * @param  {String}  phoneNumber the phone number to be checked
 * @return {Boolean}             true if phoneNumber is valid; false otherwise
 */
var isValidPhoneNumber = function(phoneNumber) {
    return phoneNumber.match(/^\d+$/) && parseInt(phoneNumber).toString().length == 10;
};

var isValidKerberos = function(kerberos) {
    return kerberos.length !== 0 && kerberos.toLowerCase() === kerberos && !findScriptingTags(kerberos);
};

var isValidPassword = function(password) {
    return password.length !== 0 && !findScriptingTags(password);
};
