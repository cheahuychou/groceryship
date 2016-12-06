$(document).ready(function () {
	$('#navbar-user').addClass('active');
	// delete all modal messages when modal gets closed
    $('.modal').on('hidden.bs.modal', function() {
        $('.modal-messages').empty();
        $('input').parent().removeClass('has-error');
    });
   	$("#edit-dormlist").val(document.getElementById('edit-dormlist').name);
   	document.getElementById('edit-dormlist').setAttribute("name", "dorm");
   	$('#edit-confirm-button').click(function () {
   		var username = $('#kerberos').text();
   		var phoneNumber = $(this).parent().find('#phone-number-register-box').val();
	   	var dorm = $(this).parent().find('#edit-dormlist :selected').val();
		var csrf = $(this).parent().find('#csrf').val();
		var hasError = false;
		// validate inputs first
        // check that all inputs are nonempty
        // if empty, alert the user of the error and show where it is
        if (!phoneNumber || !phoneNumber.match(/^\d+$/) || parseInt(phoneNumber).toString().length != 10 || !dorm || dorm.trim()=='') {
            if (!$(this).parent().hasClass('has-error')) {
                $(this).parent().addClass('has-error');
            }
            hasError = true;
            if (phoneNumber.trim() != ''){
            	addMessage('US phone numbers must have exactly 10 digits.', 'danger', true, true);
            } else {
            	addMessage('All fields must be filled out.', 'danger', true, true);
            }
            return false;
        }
        if (!hasError) {
			$.ajax({
	            url: '/users/'+ username +'/editProfile',
	            type: 'PUT',
	            data: {
			    		newPhoneNumber: phoneNumber,
			    		newDorm: dorm,
			   			_csrf: csrf
			   	},
	            success: function(data) {
	                if (data.success) {
	                    addMessage('Profile updated!', 'success', true, true);
	                    window.location.reload(false); 
	                } else {
	                    console.log(data.message);
	                    addMessage('Profile update failed', 'danger', true, true);
	                }
	            },
	            error: function(err) {
	                console.log(err);
	                addMessage('A network error might have occurred. Please try again.', 'danger', true, true);
	            }
	        });
		}
   	});
   	$('#change-password-button').click(function () {
   		var username = $('#kerberos').text();
		var currentPassword = $('#current-password-box').val();
		var newPassword = $('#new-password-box').val();
		var confirmedPassword = $('#confirmed-new-password-box').val();
		var csrf = $(this).parent().find('#csrf').val();
		var hasError = false;
		
		if (currentPassword.trim().length === 0 || /<[a-z][\s\S]*>/i.test(currentPassword)) {
			if (!$(this).parent().hasClass('has-error')) {
                $(this).parent().addClass('has-error');
            }
            hasError = true;
	        addMessage('Please enter a non-empty and valid password.', 'danger', true, true);
			return false; 
		}
		if (newPassword.trim().length === 0 || /<[a-z][\s\S]*>/i.test(newPassword)) {
			if (!$(this).parent().hasClass('has-error')) {
                $(this).parent().addClass('has-error');
            }
            hasError = true;
	        addMessage('Please enter a non-empty and valid new password.', 'danger', true, true);
			return false; 
		}
		if (confirmedPassword.trim().length === 0 || /<[a-z][\s\S]*>/i.test(confirmedPassword)) {
			if (!$(this).parent().hasClass('has-error')) {
                $(this).parent().addClass('has-error');
            }
            hasError = true;
	        addMessage('Please enter a non-empty and valid confirmed password.', 'danger', true, true);
			return false; 
		}
		if (newPassword.length < 8 || ! /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(newPassword)) {
	        // regex taken from https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
	        if (!$(this).parent().hasClass('has-error')) {
                $(this).parent().addClass('has-error');
            }
            hasError = true;
	        addMessage('Your password needs to contain at least 8 characters, and at least one uppercase character, one lowercase character, a number and one special character.', 'danger', true, true);
	        return false; 
	    }
		if (confirmedPassword !== newPassword) {
			if (!$(this).parent().hasClass('has-error')) {
                $(this).parent().addClass('has-error');
            }
            hasError = true;
	        addMessage('The password and confirmed password you entered did not match, please try again.', 'danger', true, true);
			return false;
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
