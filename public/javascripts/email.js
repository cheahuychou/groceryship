var nodemailer = require('nodemailer');
var config = require('./config.js');
var utils = require('./utils.js');

var Email = function() {

	var that = Object.create(Email.prototype);

	that.welcomeMessage = '<center><h2>Hello from GroceryShip!</h2></center>'

	// create reusable transporter object using the default SMTP transport
	var smtpConfig = {
	    host: 'smtp.gmail.com',
	    port: 465,
	    secure: true, // use SSL
	    auth: {
	        user: process.env.GMAIL_ADDRESS || config.emailAddress(),
	        pass: process.env.GMAIL_PASSWORD || config.emailPassword()
	    }
	};
	that.transporter = nodemailer.createTransport(smtpConfig);


	/**
   	* Send an email from GroceryShip email to the given kerberos
   	* @param {String} kerberos - the kerberos of the receiver of the email
	* @param {String} subject - the subject of the email
   	* @param {String} html - the html string for the email body
   	* @return {Object} object - object.success is true if the email was sent
   								successfully, false otherwise
   	*/
	that.sendEmail = function (kerberos, subject, htmlContent) {
		var mailOptions = {
		    from: 'GroceryShip 6170 <' + config.emailAddress() + '>', // sender address
		    to: kerberos + '@mit.edu',
		    subject: subject, // subject line
		    text: '', // plaintext body
		    html: htmlContent // html body
		};
		// send mail with defined transport object
		that.transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return {success: false};
		    }
		    return {success: true}
		});
	}

	/**
   	* Creates a random 16 character long token for the spepcified user
   	* @param {Object} user - the user object for while the verification token is for
   	* @param {Function} callback - the function to call after the token has been created
   	*/
	that.createVerificationToken = function (user, callback) {
		// create random 32 character token
		var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    	var token = '';
    	for (var i = utils.numTokenDigits(); i > 0; --i) {
      		token += chars[Math.round(Math.random() * (chars.length - 1))];
    	}
		user.setVerificationToken(token, callback);
	}

	/**
   	* Sends verfication email to user with the confirm button that links to verify request
   	* @param {Object} user - the user object for while the verification token is for
   	* @param {Function} callback - the function to call after the token has been created
   	* @return {Object} object - object.success is true if the email was sent
   								successfully, false otherwise
   	*/
	that.sendVerficationEmail = function (user) {
		that.createVerificationToken(user, function (err, user) {
			var subject = 'Confirm your GroceryShip Account, ' + user.username +'!';
			var content = that.welcomeMessage + '<center><p>Confirm your GroceryShip account by clicking on the confirm button below.</p></center><center><form action="http://localhost:3000/verify/' + user.username + '/' + user.verificationToken + '"><input type="submit" value="Confirm" /></form></center>';
			return that.sendEmail(user.username, subject, content);
		});
	}

	/**
   	* Makes the body of the email that a requester receives when a shopper press "Deliver Now"
   	* @param {Object} shopper - the user object for the shopper of the delivery
   	* @param {Object} requester - the user object for the requester of the delivery
   	* @return {String} the body of the email to the requester
   	*/
	that.deliveryEmailContent = function (shopper, requester) {
		return that.welcomeMessage + '<center><p> Hi ' + requester.username + '! ' + shopper.username + ' has bought a few of the items you requsted and is ready to deliver it to you. Please contact him/her at ' + shopper.phoneNumber + ' to setup a pickup time.</p>'; //TODO: insert html notification from the dashboard here
	}

	/**
   	* Sends an email to the specified requester receives when the specified shopper press "Deliver Now"
   	* @param {Object} shopper - the user object for the shopper of the delivery
   	* @param {Object} requester - the user object for the requester of the delivery
   	* @return {Object} object - object.success is true if the email was sent
   								successfully, false otherwise
   	*/
	that.sendDeliveryEmail = function (shopper, requester) {
		return that.sendEmail(requester.username, 'New Delivery', that.deliveryEmailContent(shopper, requester));
	}

	/**
   	* Makes the body of the email that a requester receives when he/she accepts a delivery
   	* @param {Object} shopper - the user object for the shopper of the delivery
   	* @param {Object} requester - the user object for the requester of the delivery
   	* @return {String} the body of the email to the requester
   	*/
	that.requesterAcceptanceEmailContent = function (shopper, requester) {
		return that.welcomeMessage + '<center><p> Hi ' + requester.username + '! ' + "Below is a summary of today's delivery from " +  shopper.username + ':</p>'; //TODO: insert html for the detail of the delivered items and payment
	}

	/**
   	* Makes the body of the email that a shopper receives when a requester accepts his/her delivery
   	* @param {Object} shopper - the user object for the shopper of the delivery
   	* @param {Object} requester - the user object for the requester of the delivery
   	* @return {String} the body of the email to the shopper
   	*/
	that.shopperAcceptanceEmailContent = function (shopper, requester) {
		return that.welcomeMessage + '<center><p> Hi ' + shopper.username + '! ' + requester.username + 'accepted your delivery, below is a summary of the tip you recieved.</p>'; //TODO: insert html for the tips 
	}

	/**
   	* Sends emails to the specified requester and shopper when a delivery is accepted
   	* @param {Object} shopper - the user object for the shopper of the delivery
   	* @param {Object} requester - the user object for the requester of the delivery
   	* @return {Object} object - object.success is true if the email was sent
   								successfully, false otherwise
   	*/
	that.sendAcceptanceEmails = function (shopper, requester) {
		that.sendEmail(requester.username, "Summary of Today's Delivery from " + shopper.username, that.requesterAcceptanceEmailContent(shopper, requester));
		that.sendEmail(shopper.username, "Delivery for " + requester.username + "accepted", that.shopperAcceptanceEmailContent(shopper, requester));
	}

	/**
   	* Makes the body of the email that a requester receives when he/she rejects a delivery
   	* @param {Object} shopper - the user object for the shopper of the delivery
   	* @param {Object} requester - the user object for the requester of the delivery
   	* @return {String} the body of the email to the requester
   	*/
	that.requesterRejectionEmailContent = function (shopper, requester) {
		return that.welcomeMessage + '<center><p> Hi ' + requester.username + '! ' + "This is to confirm that you rejected the delivery from" +  shopper.username + '</p>'; //TODO: insert html for the detail of the delivered items and payment
	}

	/**
   	* Makes the body of the email that a shopper receives when a requester rejects his/her delivery
   	* @param {Object} shopper - the user object for the shopper of the delivery
   	* @param {Object} requester - the user object for the requester of the delivery
   	* @return {String} the body of the email to the shopper
   	*/
	that.shopperRejectionEmailContent = function (shopper, requester) {
		return that.welcomeMessage + '<center><p> Hi ' + shopper.username + '! ' + requester.username + 'rejected your delivery. Please check your policy regarding returning items.</p>'; //TODO: insert html for the tips 
	}

	/**
   	* Sends emails to the specified requester and shopper when a delivery is rejected
   	* @param {Object} shopper - the user object for the shopper of the delivery
   	* @param {Object} requester - the user object for the requester of the delivery
   	* @return {Object} object - object.success is true if the email was sent
   								successfully, false otherwise
   	*/
	that.sendRejectionEmails = function (shopper, requester) {
		that.sendEmail(requester.username, "Summary of Today's Delivery from " + shopper.username, that.requesterRejectionEmailContent(shopper, requester));
		that.sendEmail(shopper.username, "Delivery for " + requester.username + "rejected", that.shopperRejectionEmailContent(shopper, requester));
	}

	Object.freeze(that);
	return that;
};

module.exports = Email();