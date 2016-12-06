// Author: Cheahuychou Mao

var nodemailer = require('nodemailer');
var config = require('./config.js');
var utils = require('./utils.js');

var Email = function() {

	var that = Object.create(Email.prototype);

	that.welcomeMessage = '<center><h2>Hello from GroceryShip!</h2></center>';
	that.signature = '<br> Cheers, <br> GroceryShip Team';

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
			var content = '{}<p>Hi {}!<br><br>Confirm your GroceryShip account by clicking on the confirm button below.<form action="{}"><input type="submit" value="Confirm" /></form>{}</p>'.format(that.welcomeMessage, user.firstName, link, that.signature);
			return sendEmail(user.username, subject, content);
		});
	}

	/**
   	* Makes the body of the email that a requester receives when a shopper claims his/her delivery
   	* @param {Object} delivery - the delivery object of the delivery that just got claimed
   	* @return {String} the body of the email to the requester
   	*/
	var claimEmailContent = function (delivery) {
		return  '{}<p> Hi {}!<br><br>{} {} has bought {} ({}) you recently requested and is ready to deliver it to you. Please contact him/her at {} to setup a pickup time.<br>{}</p>'.format(that.welcomeMessage, delivery.requester.firstName, delivery.shopper.firstName, delivery.shopper.lastName, delivery.itemName, delivery.itemQuantity, delivery.shopper.phoneNumber, that.signature);		
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
		return  '{}<p> Hi {}! <br><br> {} {} is delivering {} ({}) to {} on {}. Please be sure to be there in time!<br>{}</p>'.format(that.welcomeMessage, delivery.requester.firstName, delivery.shopper.firstName, delivery.shopper.lastName, delivery.itemName, delivery.itemQuantity, delivery.pickupLocation, delivery.pickupTime, that.signature);		
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
		return '{}<p> Hi {}!<br><br> This is to confirm that you accepted the delivery for {} from {} {} on {}. The total cost was &#36;{}, and the tip was &#36;{}. The payment has been completed successfully. <br><br>Have a nice day!<br>{}</p>'.format(that.welcomeMessage, delivery.requester.firstName, delivery.itemName, delivery.shopper.firstName, delivery.shopper.lastName, delivery.pickupTime, delivery.actualPrice, delivery.tips, that.signature);
	}

	/**
   	* Makes the body of the email that a shopper receives when a requester accepts his/her delivery
   	* @param {Object} delivery - the delivery object of the delivery that just got rejected
   	* @return {String} the body of the email to the shopper
   	*/
	var shopperAcceptanceEmailContent = function (delivery) {
		return '{}<p> Hi {}! <br><br> This is to confirm that you accepted the delivery for {} from {} {} on {}. You received &#36;{} of tip from this delivery. The payment has been completed successfully. <br><br>Have a nice day!<br>{}</p>'.format(that.welcomeMessage, delivery.requester.firstName, delivery.itemName, delivery.shopper.firstName, delivery.shopper.lastName, delivery.pickupTime, delivery.tips, that.signature);
	}

	/**
   	* Sends emails to the specified requester and shopper when a delivery is accepted
   	* @param {Object} delivery - the delivery object of the delivery that just got accepted
   	* @return {Object} object - object.success is true if the email was sent
   								successfully, false otherwise
   	*/
	that.sendAcceptanceEmails = function (delivery) {
		var requesterSubject = "Summary of Today's Delivery from {} {}".format(delivery.shopper.firstName, delivery.shopper.lastName);
		var shopperSubject = "Delivery for {} {} accepted".format(delivery.requester.firstName, delivery.requester.lastName);
		sendEmail(delivery.requester.username, requesterSubject, requesterAcceptanceEmailContent(delivery));
		sendEmail(delivery.shopper.username, shopperSubject, shopperAcceptanceEmailContent(delivery));
	}

	/**
   	* Makes the body of the email that a requester receives when he/she rejects a delivery
   	* @param {Object} delivery - the delivery object of the delivery that just got rejected
   	* @return {String} the body of the email to the requester
   	*/
	var requesterRejectionEmailContent = function (delivery) {
		var optional_content = delivery.pickupTime ? ' on {}'.format(delivery.pickupTime) : '';
		var content = '{}<p> Hi {}! <br><br>This is to confirm that you rejected the delivery for {} from {} {}' + optional_content + '.<br>{}</p>'
		return content.format(that.welcomeMessage, delivery.requester.firstName, delivery.itemName, delivery.shopper.firstName, delivery.shopper.lastName, that.signature);
	}

	/**
   	* Makes the body of the email that a shopper receives when a requester rejects his/her delivery
   	* @param {Object} delivery - the delivery object of the delivery that just got rejected
   	* @return {String} the body of the email to the shopper
   	*/
	var shopperRejectionEmailContent = function (delivery) {
		var optional_content = delivery.pickupTime ? ' on {}'.format(delivery.pickupTime) : '';
		var content = "{}<p> Hi {}! <br><br>{} {} rejected your delivery for {}" + optional_content + ". The reason was \"{}\". Please check the grocery store's policy regarding returning items if you have already bought the item/s.<br>{}</p>";
		return content.format(that.welcomeMessage, delivery.shopper.firstName, delivery.requester.firstName, delivery.requester.lastName, delivery.itemName, delivery.rejectedReason, that.signature);
	}

	/**
   	* Sends emails to the specified requester and shopper when a delivery is rejected
   	* @param {Object} delivery - the delivery object of the delivery that just got rejected
   	* @return {Object} object - object.success is true if the email was sent
   								successfully, false otherwise
   	*/
	that.sendRejectionEmails = function (delivery) {
		var requesterSubject = "Summary of Today's Delivery from {} {}".format(delivery.shopper.firstName, delivery.shopper.lastName);
		var shopperSubject = "Delivery for {} {} rejected".format(delivery.requester.firstName, delivery.requester.lastName);
		sendEmail(delivery.requester.username, requesterSubject, requesterRejectionEmailContent(delivery));
		sendEmail(delivery.shopper.username, shopperSubject, shopperRejectionEmailContent(delivery));
	}

	Object.freeze(that);
	return that;
};

module.exports = Email();