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
    var kerberos = $('#kerberos-register-box').val().trim();
    var password = $('#password-register-box').val().trim();
    var confirmPassword = $('#confirm-password-register-box').val().trim();
    var phoneNumber = formatNumberString($('#phone-number-register-box').val());
    var dorm = $('.dorm :selected').text().trim();
    if (kerberos.length === 0 || kerberos.toLowerCase() !== kerberos || findScriptingTags(kerberos)) {
        addMessage('Please enter a non-empty and valid kerberos.', 'danger', true, true);
        return false; 
    }
    if (password.length === 0 || findScriptingTags(password)) {
        addMessage('Please enter a non-empty and valid password.', 'danger', true, true);
        return false; 
    }
    if (! testPasswordStrength(password)) {
        addMessage('Your password needs to contain at least 8 characters, and at least one uppercase character, one lowercase character, a number and one special character.', 'danger', true, true);
        return false; 
    }
    if (confirmPassword !== password) {
        addMessage('The password and confirm password you entered did not match, please try again.', 'danger', true, true);
        return false;
    }
    if (!phoneNumber.match(/^\d+$/) || parseInt(phoneNumber).toString().length != 10) {
        addMessage('Please enter a valid US phone number with 10 digits.', 'danger', true, true);
        return false;
    }

}

$(document).ready(function () {
    $('#verify-button').click(function () {
        var username = $('#username').val();
        var verificationToken = $('#verificationToken').val();
        var csrf = $('#csrf').val();
        console.log(username, verificationToken, csrf);
        $.ajax({
            url: '/verify/'+username+'/'+verificationToken,
            type: 'PUT',
            data: {username: username, verificationToken: verificationToken, _csrf: csrf},
            success: function(data) {
                if (data.success) {
                    addMessage('Verification succeeded! Redirecting you to the homepage...', 'success', false, true);
                    if (typeof data.redirect === 'string') {
                        setTimeout(function(){
                            window.location = data.redirect
                        }, 1000);   
                    }
                } else {
                    addMessage('Verification failed!', 'danger', false, true);
                }
            },
            error: function(err) {
                console.log(err);
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
