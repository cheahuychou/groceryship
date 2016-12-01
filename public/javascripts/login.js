/**
* Checks that the kerberos and password for the login form are
* non-empty strings and do not contain html elements, alert
* the user if these are not satisified
* @return {Boolean} false if the kerberos and password violate
*                   the constraints 
*/
var checkLogInForm = function () {
    console.log('can you see me login');
    var kerberos = $('#kerberos-box').val().trim();
    var password = $('#password-box').val().trim();
    if (kerberos.length === 0 || /<[a-z][\s\S]*>/i.test(kerberos)) {
        addMessage('Please enter a valid kerberos.', 'danger', false, true);
        return false; 
    }
    if (password.length === 0 || /<[a-z][\s\S]*>/i.test(password)) {
        addMessage('Please enter a valid password.', 'danger', false, true);
        return false; 
    }
}


/**
* Checks that the fields in the signup form are non-empty strings,
* valid and do not contain html elements, alert the user if
* these are not satisified
* @return {Boolean} false if the kerberos and password violate
*                   the constraints 
*/
var checkSignUpForm = function () {
    console.log('can you see me signup');
    var kerberos = $('#kerberos-register-box').val().trim();
    var password = $('#password-register-box').val().trim();
    var confirmPassword = $('#confirm-password-register-box').val().trim();
    var phoneNumber = $('#phone-number-register-box').val().trim();
    var dorm = $('.dorm :selected').text().trim();
    if (kerberos.length === 0 || kerberos.toLowerCase() !== kerberos || /<[a-z][\s\S]*>/i.test(kerberos)) {
        addMessage('Please enter a non-empty and valid kerberos.', 'danger', true, true);
        return false; 
    }
    if (password.length === 0 || /<[a-z][\s\S]*>/i.test(password)) {
        addMessage('Please enter a non-empty and valid password.', 'danger', true, true);
        return false; 
    }
    if (confirmPassword !== password || /<[a-z][\s\S]*>/i.test(password)) {
        addMessage('The password and confirm password you entered did not match, please try again.', 'danger', true, true);
        return false;
    }
    if (!mitId.match(/^\d+$/) || mitId.length != 9) {
        addMessage('MIT ID must be a nine-digit number.', 'danger', true, true);
        return false;
    }
    if (!phoneNumber.match(/^\d+$/) || parseInt(phoneNumber).toString().length != 10) {
        addMessage('Please enter a valid US phone number with 10 digits.', 'danger', true, true);
        return false;
    }

}