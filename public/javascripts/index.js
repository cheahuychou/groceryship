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

