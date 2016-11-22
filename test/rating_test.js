var assert = require('chai').assert;
var mongoose = require("mongoose");
var User = require("../models/user");
var Delivery = require("../models/delivery");
var Rating = require("../models/rating");

describe("App", function() {
		// The mongoose connection object.
		var con;
		// Before running any test, connect to the database.
		before(function(done) {
			  con = mongoose.connect("mongodb://localhost/grocery-test", function() {
			    	done();
			  });
		});

		// Delete the database before each test.
		beforeEach(function(done) {
		  	con.connection.db.dropDatabase(function() { done(); });
		});

		describe("Rating", function() {

				var testUser1 = new User({
						"username": "test-user1",
			      "password": "something",
			      "mit_id": 1,
			      "phone_number": 1,
			      "dorm": "Baker"}
				);
				var id1 = testUser1._id;

				var testUser2 = new User({
						"username": "test-user2",
			      "password": "something2",
			      "mit_id": 2,
			      "phone_number": 2,
			      "dorm": "Random"}
				);
				var id2 = testUser2._id;

				var testDelivery1 = new Delivery({
						stores: ["HMart"],
		        status: "pending",
		        deadline: new Date('2016-11-21T23:59:59'),
		        itemName: "test-item",
		        itemDescription: "test-description",
		        itemQuantity: "test-quantity",
		        estimatedPrice: 3.5,
		        tips: 0.5,
		        pickupLocation: "Baker",
		        requester: id1,
		      	shopper: id2}
				);

				var deliveryId = testDelivery1._id;

		  	it("The rating should have minimum required fields.", function(done) {
		  			Rating.create({
			  				delivery: deliveryId,
			  				requesterRating: 5,
			  				shopperRating: 4,
		  			}, function (err, rating){
		  					assert.isNull(err);
		  					done();
		  			});
				});
		});
});
