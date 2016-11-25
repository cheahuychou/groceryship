var dateFormat = require('dateformat');

var Utils = function() {

	var that = Object.create(Utils.prototype);
	that.welcomeMessage = '<center><h2>Hello from GroceryShip!</h2></center>'

	/**
	* @return {Array} the list of all dorms in MIT that a user can register himself under
	*/
	that.allDorms = function() {
		return ['Baker', 'Burton Conner', 'East Campus', 'MacGregor', 'Maseeh',
                'McCormick', 'New House', 'Next House', 'Random', 'Senior',
                'Simmons'];
	};

	/**
	* @return {Array} the list of all pickup locations which a user can request goods to be delivered to
	*/
	that.allPickupLocations = function() {
		return ['Maseeh', 'McCormick', 'Baker', 'Burton Conner', 'MacGregor', 'New House', 'Next House',
                    'East Campus', 'Senior', 'Random', 'Simmons', 'Lobby 7', 'Lobby 10', 'Stata'];
	};

	/**
	* @return {Array} the list of all stores which the user can request goods from
	*/
	that.allStores = function() {
		return ["HMart", "Star Market", "Trader Joe's", "Whole Foods"];
	};

	/**
   * Reverse the given array (not in place)
   * @param {Array} array - array to reverse
   * @return {Array} a new reversed array 
   */
	that.reverseArray = function (array) {
		var reversed_array = [];
		reversed_array = reversed_array.concat(array);
		reversed_array.reverse();
		return reversed_array;
	}

	// taken from lectures
	var from_to = function (from, to, f) {
		if (from > to) return;
		f(from); from_to(from+1, to, f);
	}

	// taken from lecture
	that.each = function (a, f) {
		from_to(0, a.length-1, function (i) {f(a[i]);});
	}

	/**
   * Checks if the request has a defined session and correct authentication
   * @param {Object} req - request to check for authentication
   * @param {Object} res - response from the previous function
   * @param {Function} next - callback function
   * @return {Boolean} true if the request has the authenication, false otherwise
   */
	that.isAuthenticated = function (req, res, next) {
		if (req.params.username == undefined && req.isAuthenticated() || 
				req.isAuthenticated() && req.params.username === req.session.passport.user.username) {
				next();
		} else if (req.isAuthenticated()) {
			res.redirect('/users/'+req.session.passport.user.username);
		} else {
			res.render('home', { title: 'GroceryShip', message: 'Please log in below'});
		}
	}


	/**
   * Reformat the deadline of each delivery
   * @param {Array} deliveries - array of delivery objects
   * @return {Array} a new array of delivery objects with deadline formatted
   */
	that.formatDate = function (deliveries) {
		var deliveries = JSON.parse(JSON.stringify(deliveries)); // deep copy
		return deliveries.map(function (delivery) {
					delivery.deadline = dateFormat(delivery.deadline, "mmmm dS, h:MM TT");
					if (delivery.pickupTime) {
						delivery.pickupTime = dateFormat(delivery.pickupTime, "mmmm dS, h:MM TT");
					}
                	return delivery;
               });
	}


	/**
   * Creates a random 16 character long token for the spepcified user
   * @param {Array} deliveries - array of delivery objects
   * @return {Array} a new array of delivery objects with deadline formatted
   */
	that.createVerificationToken = function (user, callback) {
		// taken from https://www.quora.com/How-can-you-send-a-password-email-verification-link-using-NodeJS-1
		// create random 16 character token
		var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    	var token = '';
    	for (var i = 16; i > 0; --i) {
      		token += chars[Math.round(Math.random() * (chars.length - 1))];
    	}
 		// create expiration date
		var expires = new Date();
		expires.setHours(expires.getHours() + 6);
		user.setVerificationToken(token, callback);
	}

	that.verficationEmailSubject = function (kerberos) {
		return 'Confirm your GroceryShip Account, ' + kerberos +'!';
	}

	that.verficationEmailContent = function (token) {
		console.log('token received', token)
		return that.welcomeMessage + '<center><p>Confirm your GroceryShip account by clicking on the confirm button below.</p></center><form action="http://localhost:3000/verify/' + token + '"><input type="submit" value="Confirm" /></form>';
	}

	that.sendVerficationEmail = function (user, transporter) {
		that.createVerificationToken(user, function (err, user) {
			return that.sendEmail(user.username, that.verficationEmailSubject(user.username), that.verficationEmailContent(user.verificationToken), transporter);
		});
		
	}

	that.sendEmail = function (kerberos, subject, htmlContent, transporter) {
		console.log('sending email');
		console.log(kerberos, subject, htmlContent);
		var mailOptions = {
		    from: 'GroceryShip 6170 <groceryship6170@gmail.com>', // sender address
		    to: kerberos + '@mit.edu',
		    subject: subject, // Subject line
		    text: '', // plaintext body
		    html: htmlContent // html body
		};
		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return {success: false};
		    }
		    return {success: true}
		});
	}

	Object.freeze(that);
	return that;
};

module.exports = Utils();