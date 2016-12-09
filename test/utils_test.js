// Author: Cheahuychou Mao

var assert = require("assert");
var utils = require('../javascripts/utils.js');
var mongoose = require("mongoose");
var User = require("../models/user");
var Delivery = require("../models/delivery");

describe("Utils", function() {

    describe("reverseArray", function() {
        it("should reverse the array correctly", function() {
            var reversed_array = utils.reverseArray([2, 1, 3]);
            assert(reversed_array.length === 3 && reversed_array[0] === 3 && reversed_array[1] === 1 && reversed_array[2] === 2);
        });

        it("should not throw an error when the array is empty", function() {
            var reversed_array = utils.reverseArray([]);
            assert(reversed_array.length === 0);
        });
    });

    describe("formatDate", function() {

        var con;
        var pendingDelivery, acceptedDelivery;

        // Before running any test, connect to the database.
        before(function(done) {
            con = mongoose.connect("mongodb://localhost/grocery-utils-test", function() {
                var userJSON1 = {"username": "testUser1", "password": "Iwantpizza3@", "mitId": 123456789, "phoneNumber": 1234567890, "dorm": "Baker", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "firstName": "testFirstName1", "lastName": "testLastName1"};

                var userJSON2 = {"username": "testUser2", "password": "Iwantpizza3@", "mitId": 234567890, "phoneNumber": 2345678901, "dorm": "MacGregor", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "firstName": "testFirstName2", "lastName": "testLastName2"};

                User.create([userJSON1, userJSON2], function(err, users) {
                    if (err) {
                        console.log("Default users not created");
                        console.log(err.message);
                    }

                    pendingDelivery = {stores: ["HMart", "Star Market"],
                        status: "pending",
                        deadline: new Date('2016-11-21T23:59:59'),
                        itemName: "test-item-beer",
                        itemDescription: "test-description-bluegirl",
                        itemQuantity: "test-quantity-6",
                        estimatedPrice: 3.5,
                        tips: 0.5,
                        pickupLocation: "Baker",
                        requester: users[0]._id
                    };

                    acceptedDelivery = {stores: ["Whole Foods", "Trader Joe's"],
                        status: "accepted",
                        deadline: new Date('2016-11-23T11:00:30'),
                        itemName: "test-item-icecream",
                        itemDescription: "test-description-talenti",
                        itemQuantity: "test-quantity-1",
                        estimatedPrice: 15.50,
                        tips: 2,
                        pickupLocation: "McCormick",
                        requester: users[0]._id,
                        shopper: users[1]._id, 
                        actualPrice: 14,
                        pickupTime: new Date('2016-11-22T23:00:59')
                    };
                    done();
                });
            });
        });

        // Delete the database before each test.
        after(function(done) {
            con.connection.db.dropDatabase(function() {
                done();
            });
            
        });

        it("should format both due and pickup time correctly", function(done) {
            var formatedDeliveries = utils.formatDate([acceptedDelivery]);
            assert(formatedDeliveries[0].deadline === 'Nov 23, 6:00 AM' && formatedDeliveries[0].pickupTime === 'Nov 22, 6:00 PM');
            done();
        });

        it("should not modify the original deliveries", function(done) {
            var formatedDeliveries = utils.formatDate([acceptedDelivery]);
            assert(acceptedDelivery.deadline.toString() === new Date('2016-11-23T11:00:30').toString() && acceptedDelivery.pickupTime.toString() === new Date('2016-11-22T23:00:59').toString());
            done();
        });

        it("should still format due time and not throw an error when pickup time is not set", function(done) {
            var formatedDeliveries = utils.formatDate([pendingDelivery]);
            assert(formatedDeliveries[0].deadline === 'Nov 21, 6:59 PM'); 
            done();
        });

        it("should format both due and pickup time correctly for every delivery", function(done) {
            var formatedDeliveries = utils.formatDate([acceptedDelivery, pendingDelivery]);
            assert(formatedDeliveries[0].deadline === 'Nov 23, 6:00 AM' && formatedDeliveries[0].pickupTime === 'Nov 22, 6:00 PM' && formatedDeliveries[1].deadline === 'Nov 21, 6:59 PM'); 
            done();
        });
    });
});