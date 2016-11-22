var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

var UserSchema = mongoose.Schema({
    username: {type: String, required: true, index: true}, // username must be kerberos
    password: {type: String, required: true}, // should be just the hash
    mitId: {type: Number, required: true},
    phoneNumber: {type: Number, required: true},
    dorm: {type: String, required: true},
});

UserSchema.path("username").validate(function(value) {
    return value.trim().length > 0;
}, "No empty kerberos");

UserSchema.path("password").validate(function(value) {
    return value.trim().length > 0;
}, "No empty passwords");

UserSchema.path("mitId").validate(function(value) {
    return value.toString().length === 9;
}, "MIT ID must have exactly 9 digits");

UserSchema.path("phoneNumber").validate(function(value) {
    return value.toString().length === 10;
}, "US phone numbers must have exactly 10 digits");

UserSchema.path("dorm").validate(function(value) {
    var dorms = ['Baker', 'Burton Conner', 'East Campus', 'MacGregor', 'Maseeh',
                    'McCormick', 'New House', 'Next House', 'Random', 'Senior',
                    'Simmons']
    return value.trim().length > 0 && dorms.indexOf(value) > -1;
}, "Not a valid dorm name");


var UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;