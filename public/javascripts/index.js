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