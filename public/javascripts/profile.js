// Author: Chien-Hsun Chang

$(document).ready(function () {
    $('#navbar-user').addClass('active');

    // delete all modal messages when modal gets closed
    $('.modal').on('hidden.bs.modal', function() {
        $('.modal-messages').empty();
        $('input').parent().removeClass('has-error');
    });

    $('#profile-edit-modal').on('shown.bs.modal', function() {
        $('#phone-number-register-box').focus();
    });

    $('#change-password-modal').on('shown.bs.modal', function() {
        $('#current-password-box').focus();
    });

    $("#edit-dormlist").val(document.getElementById('edit-dormlist').name);
    document.getElementById('edit-dormlist').setAttribute("name", "dorm");
    $('#edit-confirm-button').click(function () {
        var username = $('#kerberos').text();
        var phoneNumber = formatNumberString($('#phone-number-register-box').val());
        var dorm = $('#edit-dormlist :selected').val();
        var csrf = $('#csrf').val();
        var hasError = false;
        // validate inputs first
        // check that all inputs are nonempty
        // if empty, alert the user of the error and show where it is
        if (!phoneNumber || !isValidPhoneNumber(phoneNumber) || !dorm || dorm.trim()=='') {
            showError('#phone-number-register-box');
            hasError = true;
            if (phoneNumber.trim() != ''){
                addMessage('US phone numbers must have exactly 10 digits.', 'danger', true, true);
            } else {
                addMessage('All fields must be filled out.', 'danger', true, true);
            }
            return false;
        } else {
            $('#phone-number-register-box').parent().removeClass('has-error');
        }
        if (!hasError) {
            $.ajax({
                url: '/users/'+ username +'/profile/edit',
                type: 'PUT',
                data: {
                        newPhoneNumber: phoneNumber,
                        newDorm: dorm,
                        _csrf: csrf
                },
                success: function(data) {
                    if (data.success) {
                        addMessage('Profile updated!', 'success', true, true);
                        setTimeout(function(){
                            window.location.reload(false); 
                        }, 800);
                    } else {
                        addMessage('Profile update failed', 'danger', true, true);
                    }
                },
                error: function(err) {
                    addMessage('A network error might have occurred. Please try again.', 'danger', true, true);
                }
            });
        }
    });
    $('#change-password-button').click(function () {
        var username = $('#kerberos').text();
        var currentPassword = $('#current-password-box').val().trim();
        var newPassword = $('#new-password-box').val().trim();
        var confirmedPassword = $('#confirmed-new-password-box').val().trim();
        var csrf = $('#csrf').val();
        var hasError = false;
        
        if (!isValidPassword(currentPassword)) {
            showError('#current-password-box');
            hasError = true;
            addMessage('Please enter a non-empty and valid password.', 'danger', true, true);
            $('#current-password-box').focus();
            return false; 
        } else {
            $('#current-password-box').parent().removeClass('has-error');
        }
        if (!isValidPassword(newPassword)) {
            showError('#new-password-box');
            hasError = true;
            addMessage('Please enter a non-empty and valid new password. Note that spaces at the ends are trimmed.', 'danger', true, true);
            $('#new-password-box').focus();
            return false; 
        } else {
            $('#new-password-box').parent().removeClass('has-error');
        }
        if (!isValidPassword(confirmedPassword)) {
            showError('#confirmed-new-password-box');
            hasError = true;
            addMessage('Please enter a non-empty and valid confirmation of your new password. Note that spaces at the ends are trimmed.', 'danger', true, true);
            $('#confirmed-new-password-box').focus();
            return false; 
        } else {
            $('#confirmed-new-password-box').parent().removeClass('has-error');
        }
        if (!testPasswordStrength(newPassword)) {
            showError('#new-password-box');
            hasError = true;
            addMessage('Your password needs to contain at least 8 characters, and at least one uppercase character,' 
                + ' one lowercase character, a number and one special character.', 'danger', true, true);
            $('#new-password-box').focus();
            return false; 
        } else {
            $('#new-password-box').parent().removeClass('has-error');
        }
        if (confirmedPassword !== newPassword) {
            showError('#new-password-box, #confirmed-new-password-box');
            hasError = true;
            addMessage('The new passwords you entered did not match. Please try again.', 'danger', true, true);
            $('#new-password-box').focus();
            return false;
        } else {
            $('#new-password-box').parent().removeClass('has-error');
            $('#confirmed-new-password-box').parent().removeClass('has-error');
        }
        if(!hasError){
            $.ajax({
                url: '/users/'+ username +'/changePassword',
                type: 'PUT',
                data: {
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                    _csrf: csrf
                },
                success: function(data){
                    if (data.success) {
                        $('#change-password-modal').modal('toggle');
                        addMessage('Password changed!', 'success', false, true);
                    } else {
                        addMessage(data.message, 'danger', true, true);
                    }
                },
                error: function(err) {
                    addMessage('A network error might have occurred. Please try again.', 'danger', true, true);
                }
            });
        }
    });
});
