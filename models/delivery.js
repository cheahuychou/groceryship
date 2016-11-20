var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

var DeliverySchema = mongoose.Schema({
    stores: {type: String, required: true, index: true}, // username must be kerberos
    status:
    deadline:
    itemName:
    itemDescription:
    itemPrice:
    tips:
    pickupLocation:
    requester:
    shopper:
    pickupTime:
});



var DeliveryModel = mongoose.model("Delivery", DeliverySchema);

module.exports = DeliveryModel;