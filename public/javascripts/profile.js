/**
* Checks that the fields in the signup form are non-empty strings,
* valid and do not contain html elements, alert the user if
* these are not satisified
* @return {Boolean} false if the kerberos and password violate
*					the constraints 
*/
var checkPasswordChange = function () {
	
	  
}

$(document).ready(function () {
	$('#navbar-user').addClass('active');
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
        if (!phoneNumber || phoneNumber.trim().length!=10 || !dorm || dorm.trim()=='') {
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
	                    addMessage('Password changed!', 'success', true, true);
	                } else {
	                    console.log(data.message);
	                    addMessage(data.message, 'danger', true, true);
	                }
	            },
	            error: function(err) {
	                console.log(err);
	                console.log("yoooo");
	                addMessage('A network error might have occurred. Please try again.', 'danger', true, true);
	            }
	        });
		}
   	});
});
