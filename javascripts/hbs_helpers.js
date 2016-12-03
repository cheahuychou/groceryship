var HbsHelpers = function() {
	var that = Object.create(HbsHelpers.prototype);

	that.ifIsPast = function(time, now, options) {
        if (now >= time) {
            return options.fn(this);
        }
        return options.inverse(this);
    }
    
    that.add = function(a, b) {
        return a+b;
    }

    that.ifContains = function(a, b, options) {
        if (a instanceof Array) {
            if (a.indexOf(b) > -1) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        } else {
            if (a === b) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        }
    }

	Object.freeze(that);
    return that;
};

module.exports = HbsHelpers();