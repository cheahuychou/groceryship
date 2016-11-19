var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

var UserSchema = mongoose.Schema({
    username: {type: String, required: true, index: true}, // username must be kerberos
    password: {type: String, required: true}, // should be just the hash
    mit_id: {type: Number, required: true},
    phone_number: {type: Number, required: true},
    dorm: {type: String, required: true},
});

UserSchema.path("username").validate(function(value) {
    return value.trim().length > 0;
}, "No empty kerberos");

UserSchema.path("password").validate(function(value) {
    return value.trim().length > 0;
}, "No empty passwords");


var UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;