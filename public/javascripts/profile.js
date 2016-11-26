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
});
