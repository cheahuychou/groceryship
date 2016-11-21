var Utils = function() {

	var that = Object.create(Utils);

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
		}
		 else if (req.isAuthenticated()) {
			res.redirect('/users/'+req.session.passport.user.username);
		} else {
			res.render('home', { title: 'GroceryShip', message: 'Please log in below'});
		}
	}

	Object.freeze(that);
	return that;
};

module.exports = Utils();