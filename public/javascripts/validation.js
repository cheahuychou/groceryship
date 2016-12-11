// Author: Czarina Lao

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
    return phoneNumber.match(/^\d+$/) !== null && parseInt(phoneNumber).toString().length == 10;
};

/**
 * Checks if kerberos is a valid kerberos
 * @param  {String}  kerberos kerberos to be checked
 * @return {Boolean}          true if it is valid; false otherwise
 */
var isValidKerberos = function(kerberos) {
    return kerberos.trim().length !== 0 && kerberos.toLowerCase() === kerberos && !findScriptingTags(kerberos);
};

/**
 * Checks if password is a valid password
 * @param  {String}  password password to be checked
 * @return {Boolean}          true if it is valid; false otherwise
 */
var isValidPassword = function(password) {
    return password.trim().length !== 0 && !findScriptingTags(password);
};
