// Author: Czarina Lao

/**
 * Adds the message message to the area with id messages.
 * @param {String} message  The message
 * @param {String} type     The type of message: success, warning, info, or danger
 * @param {Boolean} clearOld if true, clears old messages
 */
var addMessage = function(message, type, clearOld) {
    if (clearOld) $('#messages').empty();
    var messageDiv = $('<div/>');
    messageDiv.addClass('alert alert-dismissible alert-'+type);
    messageDiv.attr('role', 'alert');
    messageDiv.text(message);
    // dismiss button. code from bootstrap
    messageDiv.append('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
    $('#messages').append(messageDiv);
}

/**
 * Check that the price given by priceString is valid.
 * Accepts prices with more than 2 decimal points but rounds it to 2.
 * @param  {String} priceString the price being checked
 * @return {Float/Boolean}      the price rounded to 2 decimal places if the price is valid;
 *                                  false otherwise
 */
var checkPriceFormat = function(priceString) {
    var price = parseFloat(priceString).toFixed(2);
    if (isNaN(price) || price < 0) return false;
    return price;
};

var showPriceFormatErrors = function(element) {
    var price = checkPriceFormat($(element).val());
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
    var minDateTime = currentTime.getFullYear()  + "-" + (currentTime.getMonth()+1) + "-" + currentTime.getDate() + "T00:00:00"; 
    $('.datetimepicker').each(function () {
        $(this).attr('min', minDateTime);
    });
    if (deadline) {
        var deadlineString = deadline.split(',')[0];
        deadlineString = deadlineString.substring(0, deadlineString.length - 2);
        var dueTime = new Date(Date.parse(deadlineString));
        var maxDateTime = currentTime.getFullYear()  + "-" + (dueTime.getMonth()+1) + "-" + dueTime.getDate() + "T00:00:00";
        $('.datetimepicker').attr('max', maxDateTime);
    }
}