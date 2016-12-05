var assert = require('chai').assert;
var mongoose = require("mongoose");
var User = require("../models/user");
var Delivery = require("../models/delivery");

describe("App", function() {
	// The mongoose connection object.
	var con;

	// Test users.
	var testUser1, testUser2;

	// Ids of the default test users.
	var id1, id2;

	// Some default deliveries.
	var testDeliveryJSON;

	// Before running any test, connect to the database.
	before(function(done) {
		con = mongoose.connect("mongodb://localhost/grocery-test", function() {
			con.connection.db.dropDatabase(function() { 
		    	var user1 = new User({
				    "username": "test-user1",
					"password": "Iwantpizza3@",
					"firstName": "firstName1",
					"lastName": "lastName1",
					"phoneNumber": 1234567890,
					"dorm": "Baker",
					"stripeId":"testuserStripeId", 
					"stripeEmail": "testuserStripeEmail",
					"stripePublishableKey": "testuserStripePublishableKey"
				});

				var user2 = new User({
					"username": "test-user2",
					"password": "Iwantpizza3@",
					"firstName": "firstName2",
					"lastName": "lastName2",
					"phoneNumber": 2345678900,
					"dorm": "Random",
					"stripeId":"testuserStripeId", 
					"stripeEmail": "testuserStripeEmail",
					"stripePublishableKey": "testuserStripePublishableKey"
				});

				User.create([user1, user2], function(err, users) {
					if (err) {
					console.log("Default users not created");
					console.log(err.message);
					}

					testUser1 = users[0];
					testUser2 = users[1];

					id1 = testUser1._id;
					id2 = testUser2._id;

					testDeliveryJSON = {
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
				      	shopper: id2
				    }
					done(); 
				});
		    });
		});
	});

	// Delete the deliveries collection before each test.
	beforeEach(function(done) {
		con.connection.db.dropCollection("deliveries", function() { done(); });
	});

	describe("Rating", function() {

		

	  	it("can contain requester and shopper ratings in the delivery model", function(done) {
  			testDeliveryJSON["requesterRating"] = 4;
  			testDeliveryJSON["shopperRating"] = 5;
  			Delivery.create(testDeliveryJSON, function (err, delivery){
				assert.strictEqual(delivery.requesterRating, 4);
				assert.strictEqual(delivery.shopperRating, 5);
				done();
  			});
		});

	  	it("can contain a rejected reason in the delivery model", function(done) {
  			testDeliveryJSON["rejectedReason"] = "I don't need the item anymore.";
  			testDeliveryJSON["shopperRating"] = 2;
  			Delivery.create(testDeliveryJSON, function (err, delivery){
				assert.strictEqual(delivery.rejectedReason, "I don't need the item anymore.");
				assert.strictEqual(delivery.shopperRating, 2);
				done();
  			});
		});

	  	it("the user has a default average rating", function(done){
			assert.strictEqual(testUser1.completedRequests.length, 0);
  			assert.strictEqual(testUser1.avgRequestRating, 5);
  			assert.strictEqual(testUser1.completedShippings.length, 0);
  			assert.strictEqual(testUser1.avgShippingRating, 5);
  			done();
 		});

		it("can add a completed request to the user model and update the average rating", function(done){
			testDeliveryJSON["requesterRating"] = 4;
  			Delivery.create(testDeliveryJSON, function(err, delivery){
  				testUser1.addCompletedRequest(delivery._id, delivery.requesterRating);
  				assert.strictEqual(testUser1.completedRequests.length, 1);
  				assert.strictEqual(testUser1.avgRequestRating, 4);
  				done();
  			});
		});

		it("can add a completed shipping to the user model and update the average rating", function(done){
			testDeliveryJSON["shopperRating"] = 5;
  			Delivery.create(testDeliveryJSON, function(err, delivery){
  				testUser1.addCompletedShipping(delivery._id, delivery.shopperRating);
  				delivery["shopperRating"] = 4;
  				testUser1.addCompletedShipping(delivery._id, delivery.shopperRating);
  				assert.strictEqual(testUser1.completedShippings.length, 2);
  				assert.strictEqual(testUser1.avgShippingRating, 4.5);
  				done();
  			});
		});
	});
});
