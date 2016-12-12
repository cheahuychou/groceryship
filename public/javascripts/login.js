// Author: Joseph Kuan

/**
* Checks that the kerberos and password for the login form are
* non-empty strings and do not contain html elements, alert
* the user if these are not satisified
* @return {Boolean} false if the kerberos and password violate
*                   the constraints 
*/
var checkLogInForm = function () {
    var kerberos = $('#kerberos-box').val().trim();
    var password = $('#password-box').val().trim();
    // make sure inputs are nonempty
    if (!isValidKerberos(kerberos)) {
        showError('#kerberos-box');
        addMessage('Please enter a valid kerberos.', 'danger', false, true);
        return false; 
    } else {
        $('#kerberos-box').parent().removeClass('has-error');
    }
    if (!isValidPassword(password)) {
        showError('#password-box');
        addMessage('Please enter a valid password.', 'danger', false, true);
        return false; 
    } else {
        $('#password-box').parent().removeClass('has-error');
    }
    // replace text submitted in form with trimmed version
    $('#kerberos-box').val(kerberos);
    $('#password-box').val(password);
}

/**
* Checks that the fields in the signup form are non-empty strings,
* valid and do not contain html elements, alert the user if
* these are not satisified
* @return {Boolean} false if the kerberos and password violate
*                   the constraints 
*/
var checkSignUpForm = function () {
    var kerberos = $('#kerberos-register-box').val().trim();
    var password = $('#password-register-box').val().trim();
    var confirmPassword = $('#confirm-password-register-box').val().trim();
    var phoneNumber = formatNumberString($('#phone-number-register-box').val());
    var dorm = $('.dorm :selected').text().trim();
    // make sure inputs are nonempty and don't contain scripting tags
    // passwords can contain scripting tags because they won't be displayed and directly saved
    if (!isValidKerberos(kerberos)) {
        showError('#kerberos-register-box');
        addMessage('Please enter a non-empty and valid kerberos. Note that spaces at the ends are trimmed.', 'danger', true, true);
        return false; 
    } else {
        $('#kerberos-register-box').parent().removeClass('has-error');
    }
    if (!isValidPassword(password)) {
        showError('#password-register-box');
        addMessage('Please enter a non-empty and valid password. Note that spaces at the ends are trimmed.', 'danger', true, true);
        return false; 
    } else {
        $('#password-register-box').parent().removeClass('has-error');
    }
    if (!testPasswordStrength(password)) {
        showError('#password-register-box');
        addMessage('Your password needs to contain at least 8 characters, and at least one uppercase character, one lowercase character, a number and one special character.', 'danger', true, true);
        return false; 
    } else {
        $('#password-register-box').parent().removeClass('has-error');
    }
    if (confirmPassword !== password) {
        showError('#password-register-box');
        showError('#confirm-password-register-box');
        addMessage('The password and confirm password you entered did not match, please try again.', 'danger', true, true);
        return false;
    } else {
        $('#password-register-box').parent().removeClass('has-error');
        $('#confirm-password-register-box').parent().removeClass('has-error');
    }
    if (!isValidPhoneNumber(phoneNumber)) {
        showError('#phone-number-register-box');
        addMessage('Please enter a valid US phone number with 10 digits.', 'danger', true, true);
        return false;
    } else {
        $('#phone-number-register-box').parent().removeClass('has-error');
    }
    // replace text submitted in form with trimmed version
    $('#kerberos-register-box').val(kerberos);
    $('#password-register-box').val(password);
    $('#confirm-password-register-box').val(confirmPassword);
    $('#phone-number-register-box').val(phoneNumber);
}

$(document).ready(function () {
    $('#verify-button').click(function () {
        var username = $('#username').val();
        var verificationToken = $('#verificationToken').val();
        var csrf = $('#csrf').val();

        $.ajax({
            url: '/verify/'+username+'/'+verificationToken,
            type: 'PUT',
            data: {username: username, verificationToken: verificationToken, _csrf: csrf},
            success: function(data) {
                if (data.success) {
                    addMessage('Verification succeeded! Redirecting you to the homepage...', 'success', false, true);
                    if (typeof data.redirect === 'string') {
                        setTimeout(function(){
                            window.location = data.redirect;
                        }, 1000);   
                    }
                } else {
                    addMessage('Verification failed!', 'danger', false, true);
                }
            },
            error: function(err) {
                addMessage('A network error might have occurred. Please try again.', 'danger', false, true);
            }
        });
    });

    $('#register-modal').on('shown.bs.modal', function() {
        // when user fills in kerberos and password in the main page
        // then clicks sign up, help them fill up the sign up page
        $('#kerberos-register-box').val($('#kerberos-box').val());
        $('#password-register-box').val($('#password-box').val());

        $('#kerberos-register-box').focus();
    });
});
