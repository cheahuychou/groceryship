// Author: Cheahuychou Mao

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
	* Source: http://stackoverflow.com/a/4974690
	* Replaces the '{}' in the string by the arguments in order
	*/
	String.prototype.format = function () {
  		var i = 0, args = arguments;
  		return this.replace(/{}/g, function () {
	  		return typeof args[i] != 'undefined' ? args[i++] : '';
  		});
	};

	/**
   	* Send an email from GroceryShip email to the given kerberos
   	* @param {String} kerberos - the kerberos of the receiver of the email
	* @param {String} subject - the subject of the email
   	* @param {String} html - the html string for the email body
   	* @return {Object} object - object.success is true if the email was sent
   								successfully, false otherwise
   	*/
	var sendEmail = function (kerberos, subject, htmlContent) {
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
	that.sendVerficationEmail = function (user, developmentMode) {
		that.createVerificationToken(user, function (err, user) {
			var subject = 'Confirm your GroceryShip Account, {}!'.format(user.username);
			var link;
			if (developmentMode) {
				link = 'http://localhost:3000/verify/{}/{}'.format(user.username, user.verificationToken);
			} else {
				link = '{}/verify/{}/{}'.format((process.env.PRODUCTION_URL || config.productionUrl()), user.username, user.verificationToken);
			}
			var content = '{}<center><p>Hi {}! Confirm your GroceryShip account by clicking on the confirm button below.</p></center><center><form action="{}"><input type="submit" value="Confirm" /></form></center>'.format(that.welcomeMessage, user.firstName, link);
			return sendEmail(user.username, subject, content);
		});
	}

	/**
   	* Makes the body of the email that a requester receives when a shopper claims his/her delivery
   	* @param {Object} delivery - the delivery object of the delivery that just got claimed
   	* @return {String} the body of the email to the requester
   	*/
	var claimEmailContent = function (delivery) {
		return  '{}<center><p> Hi {} {}! {} {} has bought {} of {} you recently requested and is ready to deliver it to you. Please contact him/her at {} to setup a pickup time.</p>'.format(that.welcomeMessage, delivery.requester.firstName, delivery.requester.lastName, delivery.shopper.firstName, delivery.shopper.lastName, delivery.itemQuantity, delivery.itemName, delivery.shopper.phoneNumber)		
	}

	/**
   	* Sends an email to the requester of a delivery when a shopper claims his/her delivery
   	* @param {Object} delivery - the delivery object of the delivery that just got claimed
   	* @return {Object} object - object.success is true if the email was sent
   								successfully, false otherwise
   	*/
	that.sendClaimEmail = function (delivery) {
		var subject = 'Updates on your pending request for {}'.format(delivery.itemName)
		return sendEmail(delivery.requester.username, subject, claimEmailContent(delivery));
	}

	/**
   	* Makes the body of the email that a requester receives when the shopper presses "Deliver Now"
   	* @param {Object} delivery - the delivery object of the delivery that just got claimed
   	* @return {String} the body of the email to the requester
   	*/
	var deliveryEmailContent = function (delivery) {
		return  '{}<center><p> Hi {} {}! {} {} is delivering {} of {} to {} on {}. Please be sure to be there in time!</p>'.format(that.welcomeMessage, delivery.requester.firstName, delivery.requester.lastName, delivery.shopper.firstName, delivery.shopper.lastName, delivery.itemQuantity, delivery.itemName, delivery.pickupLocation, delivery.pickupTime);		
	}

	/**
   	* Sends an email to the requester of a delivery when the shopper presses "Deliver Now"
   	* @param {Object} delivery - the delivery object of the delivery that just got claimed
   	* @return {Object} object - object.success is true if the email was sent
   								successfully, false otherwise
   	*/
	that.sendDeliveryEmail = function (delivery) {
		var subject = 'Upcoming Delivery for {}'.format(delivery.itemName)
		return sendEmail(delivery.requester.username, subject, deliveryEmailContent(delivery));
	}

	/**
   	* Makes the body of the email that a requester receives when he/she accepts a delivery
   	* @param {Object} delivery - the delivery object of the delivery that just got rejected
   	* @return {String} the body of the email to the requester
   	*/
	var requesterAcceptanceEmailContent = function (delivery) {
		return '{}<center><p> Hi {} {}! This is to confirm that you accepted the delivery for {} from {} {} on {}. The total cost was {}, and the tip was {}. The payment has been completed successfully. Have a nice day!</p>'.format(that.welcomeMessage, delivery.requester.firstName, delivery.requester.lastName, delivery.itemName, delivery.shopper.firstName, delivery.shopper.lastName, delivery.pickupTime, delivery.actualPrice, delivery.tips);
	}

	/**
   	* Makes the body of the email that a shopper receives when a requester accepts his/her delivery
   	* @param {Object} delivery - the delivery object of the delivery that just got rejected
   	* @return {String} the body of the email to the shopper
   	*/
	var shopperAcceptanceEmailContent = function (delivery) {
		return '{}<center><p> Hi {} {}! This is to confirm that you rejected the delivery for {} from {} {} on {}. You received {} of tip from this delivery. The payment has been completed successfully. Have a nice day!</p>'.format(that.welcomeMessage, delivery.requester.firstName, delivery.requester.lastName, delivery.itemName, delivery.shopper.firstName, delivery.shopper.lastName, delivery.pickupTime, delivery.tips);
	}

	/**
   	* Sends emails to the specified requester and shopper when a delivery is accepted
   	* @param {Object} delivery - the delivery object of the delivery that just got accepted
   	* @return {Object} object - object.success is true if the email was sent
   								successfully, false otherwise
   	*/
	that.sendAcceptanceEmails = function (delivery) {
		var requesterSubject = "Summary of Today's Delivery from {}".format(delivery.shopper.username);
		var shopperSubject = "Delivery for {} accepted".format(delivery.requester.username);
		sendEmail(delivery.requester.username, requesterSubject, requesterAcceptanceEmailContent(delivery));
		sendEmail(delivery.shopper.username, shopperSubject, shopperAcceptanceEmailContent(delivery));
	}

	/**
   	* Makes the body of the email that a requester receives when he/she rejects a delivery
   	* @param {Object} delivery - the delivery object of the delivery that just got rejected
   	* @return {String} the body of the email to the requester
   	*/
	var requesterRejectionEmailContent = function (delivery) {
		return '{}<center><p> Hi {} {}! This is to confirm that you rejected the delivery for {} from {} {} on {}.</p>'.format(that.welcomeMessage, delivery.requester.firstName, delivery.requester.lastName, delivery.itemName, delivery.shopper.firstName, delivery.shopper.lastName, delivery.pickupTime);
	}

	/**
   	* Makes the body of the email that a shopper receives when a requester rejects his/her delivery
   	* @param {Object} delivery - the delivery object of the delivery that just got rejected
   	* @return {String} the body of the email to the shopper
   	*/
	var shopperRejectionEmailContent = function (delivery) {
		return "{}<center><p> Hi {} {}! {} {} rejected your delivery for {} on {}. The reason was \"{}\". Please check the grocery store's policy regarding returning items.</p>".format(that.welcomeMessage, delivery.shopper.firstName, delivery.shopper.lastName, delivery.requester.firstName, delivery.requester.lastName, delivery.itemName, delivery.pickupTime, delivery.rejectedReason);
	}

	/**
   	* Sends emails to the specified requester and shopper when a delivery is rejected
   	* @param {Object} delivery - the delivery object of the delivery that just got rejected
   	* @return {Object} object - object.success is true if the email was sent
   								successfully, false otherwise
   	*/
	that.sendRejectionEmails = function (delivery) {
		var requesterSubject = "Summary of Today's Delivery from {}".format(delivery.shopper.username);
		var shopperSubject = "Delivery for {} rejected".format(delivery.requester.username);
		sendEmail(delivery.requester.username, requesterSubject, requesterRejectionEmailContent(delivery));
		sendEmail(delivery.shopper.username, shopperSubject, shopperRejectionEmailContent(delivery));
	}

	Object.freeze(that);
	return that;
};

module.exports = Email();
