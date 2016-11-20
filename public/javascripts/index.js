/**
* Checks that the kerberos and password for the login form are
* non-empty strings and do not contain html elements, alert
* the user if these are not satisified
* @return {Boolean} false if the kerberos and password violate
*					the constraints 
*/
var checkLogInForm = function () {
	var kerberos = $('#kerberos-box').val().trim();
	var password = $('#password-box').val().trim();
	if (kerberos.length === 0 || /<[a-z][\s\S]*>/i.test(kerberos)) {
		alert('Please enter a valid kerberos');
		return false; 
	}
	if (password.length === 0 || /<[a-z][\s\S]*>/i.test(password)) {
		alert('Please enter a valid password');
		return false; 
	}
}

/**
* Checks that the fields in the signup form are non-empty strings,
* valid and do not contain html elements, alert the user if
* these are not satisified
* @return {Boolean} false if the kerberos and password violate
*					the constraints 
*/
var checkSignUpForm = function () {
	var kerberos = $('#kerberos-register-box').val().trim();
	var password = $('#password-register-box').val().trim();
	var confirmPassword = $('#confirm-password-register-box').val().trim();
	var mitId = $('#mit-id-register-box').val().trim();
	var phoneNumber = $('#phone_number-register-box').val().trim();
	var dorm = $('#dorm-register-box').val().trim();
	console.log(/<[a-z][\s\S]*>/i.test(kerberos), /<[a-z][\s\S]*>/i.test(password));
	if (kerberos.length === 0 || kerberos.toLowerCase() !== kerberos || /<[a-z][\s\S]*>/i.test(kerberos)) {
		alert('Please enter a non-empty and valid kerberos');
		return false; 
	}
	if (password.length === 0 || /<[a-z][\s\S]*>/i.test(password)) {
		alert('Please enter a non-empty and valid password');
		return false; 
	}
	if (confirmPassword !== password || /<[a-z][\s\S]*>/i.test(password)) {
		alert('The password and confirm password you entered did not match, please try again.');
		return false;
	}
	if (mitId.match(/^\d+$/) || mitId.length != 9) {
		alert('MIT ID must be a nine-digit number');
		return false;
	}

}