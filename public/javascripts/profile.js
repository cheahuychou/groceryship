/**
* Checks that the fields in the signup form are non-empty strings,
* valid and do not contain html elements, alert the user if
* these are not satisified
* @return {Boolean} false if the kerberos and password violate
*					the constraints 
*/
var checkEditForm = function () {
	var password = $('#password-register-box').val().trim();
	var confirmPassword = $('#confirm-password-register-box').val().trim();
	var phoneNumber = $('#phone-number-register-box').val().trim();
	if (password.length === 0 || /<[a-z][\s\S]*>/i.test(password)) {
		alert('Please enter a non-empty and valid password');
		return false; 
	}
	if (confirmPassword !== password || /<[a-z][\s\S]*>/i.test(password)) {
		alert('The password and confirm password you entered did not match, please try again.');
		return false;
	}
	if (!phoneNumber.match(/^\d+$/) || parseInt(phoneNumber).toString().length != 10) {
		alert('please enter a valid US phone numbers with 10 digits');
		return false;
	}
}

$(document).ready(function () {
   	$("#edit-dormlist").val(document.getElementById('edit-dormlist').name);
   	document.getElementById('edit-dormlist').setAttribute("name", "dorm");
   	
   	$('#edit-confirm-button').click(function () {
   		var username = $('#kerberos').html();
   		var password = $(this).parent().find('#password-register-box').val();
   		var phoneNumber = $(this).parent().find('#phone-number-register-box').val();
	   	var dorm = $(this).parent().find('#edit-dormlist :selected').val();
		var csrf = $(this).parent().find('#csrf').val();
		console.log('yoi');
		console.log(username, password,phoneNumber, dorm, csrf);
		$.ajax({
            url: '/users/'+ username +'/profile/edit',
            type: 'PUT',
            data: {
            		newPassword: password,
		    		newPhoneNumber: phoneNumber,
		    		dorm: dorm,
		   			_csrf: csrf
		   		},
            success: function(data) {
                console.log(data);
                if (data.success) {
                    addMessage('Profile updated!', 'success', true);
                } else {
                    console.log(data.message);
                    addMessage('Profile update failed', 'danger', true);
                }
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', true);
            }
        });
   	});
   	
});
