//Author: Joseph Kuan
var assert = require('chai').assert;
var mongoose = require("mongoose");
var User = require('../models/user');
var Delivery = require('../models/delivery');

describe("Models", function() {
  // The mongoose connection object.
  var con;

  // ids of the default test users
  var id1, id2, id3, id_suspended, id_rating_2, id_rating_5;

  // Some default deliveries
  var pending_delivery1, claimed_delivery1, rejected_delivery1, accepted_delivery1;

  // Before running any test, connect to the database & drop database. Also, create some test users and deliveries
  before(function(done) {
    con = mongoose.connect("mongodb://localhost/grocerydb-delivery-test", function() {

      con.connection.db.dropDatabase(function() {

        var testUser1 = new User({
          "username": "username1",
          "password": "Iwantpizza3@",
          "firstName": "firstName1",
          "lastName": "lastName1",
          "phoneNumber": 1234567890,
          "dorm": "Baker",
          "stripeId":"testuserStripeId",
          "stripeEmail": "testuserStripeEmail",
          "stripePublishableKey": "testuserStripePublishableKey",
          "avgRequestRating": 4
        });

        var testUser2 = new User({
          "username": "username2",
          "password": "Iwantpizza3@",
          "firstName": "firstName2",
          "lastName": "lastName2",
          "phoneNumber": 2345678901,
          "dorm": "MacGregor",
          "stripeId":"testuserStripeId",
          "stripeEmail": "testuserStripeEmail",
          "stripePublishableKey": "testuserStripePublishableKey",
          "avgRequestRating": 3.5
        });

        var testUser3 = new User({
          "username": "username3",
          "password": "Iwantpizza3@",
          "firstName": "firstName3",
          "lastName": "lastName3",
          "phoneNumber": 3456789012,
          "dorm": "New House",
          "stripeId":"testuserStripeId",
          "stripeEmail": "testuserStripeEmail",
          "stripePublishableKey": "testuserStripePublishableKey",
          "avgShippingRating": 2.8
        });

        var now = Date.now();
        var future = new Date(now + 60*60*24*7*1000); //one week after now
        var testSuspendedUser = new User({
          "username": "username4",
          "password": "Iwantpizza4@",
          "firstName": "firstName4",
          "lastName": "lastName4",
          "phoneNumber": 4567890123,
          "dorm": "Random",
          "stripeId":"testuserStripeId",
          "stripeEmail": "testuserStripeEmail",
          "stripePublishableKey": "testuserStripePublishableKey",
          "avgShippingRating": 2.5,
          "suspendedUntil": future
        });

        var testRating2User = new User({
          "username": "username5",
          "password": "Iwantpizza5@",
          "firstName": "firstName5",
          "lastName": "lastName5",
          "phoneNumber": 5678901234,
          "dorm": "Simmons",
          "stripeId":"testuserStripeId",
          "stripeEmail": "testuserStripeEmail",
          "stripePublishableKey": "testuserStripePublishableKey",
          "avgShippingRating": 2,
          "avgRequestRating": 2
        });

        var testRating5User = new User({
          "username": "username6",
          "password": "Iwantpizza6@",
          "firstName": "firstName6",
          "lastName": "lastName6",
          "phoneNumber": 6789012345,
          "dorm": "Random",
          "stripeId":"testuserStripeId",
          "stripeEmail": "testuserStripeEmail",
          "stripePublishableKey": "testuserStripePublishableKey",
          "avgShippingRating": 5,
          "avgRequestRating": 5
        });

        User.create([testUser1, testUser2, testUser3, testSuspendedUser, testRating2User, testRating5User], function(err, users) {
          if (err) {
            console.log("Default users not created");
            console.log(err.message);
          }

          id1 = users[0]._id;
          id2 = users[1]._id;
          id3 = users[2]._id;
          id_suspended = users[3]._id;
          id_rating_2 = users[4]._id;
          id_rating_5 = users[5]._id;

          pending_delivery1 = {stores: ["HMart", "Star Market"],
              status: "pending",
              deadline: new Date('2016-11-21T23:59:59'),
              itemName: "test-item-beer",
              itemQuantity: "test-quantity-6",
              estimatedPrice: 3.5,
              tips: 0.5,
              pickupLocation: "Baker",
              requester: id1};

          rejected_delivery1 = {stores: ["Whole Foods", "Trader Joe's", "Star Market", "HMart"],
              status: "rejected",
              deadline: new Date('2016-11-22T11:00:30'),
              itemName: "test-item-xx",
              itemDescription: "test-description-yy",
              itemQuantity: "test-quantity-3",
              estimatedPrice: 15.50,
              tips: 2,
              pickupLocation: "McCormick",
              requester: id2,
              shopper: id1, 
              actualPrice: 20,
              pickupTime: new Date('2016-11-21T23:00:59'),
              requesterRating: 2,
              shopperRating: 3,
              rejectedReason: "items not fresh",
              seenExpired: false,
              stripeTransactionId: "someTransactionID",
              minShippingRating: 3};

          accepted_delivery1 = {stores: ["Whole Foods", "Trader Joe's"],
              status: "accepted",
              deadline: new Date('2016-11-23T11:00:30'),
              itemName: "test-item-icecream",
              itemDescription: "test-description-talenti",
              itemQuantity: "test-quantity-1",
              estimatedPrice: 15.50,
              tips: 2,
              pickupLocation: "McCormick",
              requester: id3,
              shopper: id2, 
              actualPrice: 14,
              pickupTime: new Date('2016-11-22T23:00:59')};

          claimed_delivery1 = {stores: ["Trader Joe's"],
              status: "claimed",
              deadline: new Date('2016-11-22T10:30:00'),
              itemName: "test-item-sausages",
              itemDescription: "test-description-yuge",
              itemQuantity: "test-quantity-many",
              estimatedPrice: 8,
              tips: 1,
              pickupLocation: "New House",
              requester: id2,
              shopper: id1,
              actualPrice: 12,
              pickupTime: new Date('2016-11-21T23:00:59')};

          done();
        });
      });
    });
  });

  // Delete the deliveries collection before each test.
  beforeEach(function(done) {
    con.connection.db.dropCollection("deliveries", function() { done(); });
  });

  describe("Delivery", function() {

    describe("Basic Model and Validation", function() {
      it("should have minimum required fields of a delivery", function(done) {
        Delivery.create(pending_delivery1, function() {
          Delivery.findOne({"itemName": "test-item-beer"}, function(err, doc) {
            assert.strictEqual(doc.requester.toString(), id1.toString());
            assert.strictEqual(doc.estimatedPrice, 3.5);
            assert.strictEqual(doc.itemQuantity, "test-quantity-6");
            done();
          });
        });
      });

      it("should have all fields of a delivery present in the design model", function(done) {
        Delivery.create(rejected_delivery1 ,function() {
          Delivery.findOne({requester: id2}, function(err, doc) {
            assert.strictEqual(doc.itemDescription, "test-description-yy");
            assert.strictEqual(doc.estimatedPrice, 15.5);
            assert.strictEqual(doc.itemQuantity, "test-quantity-3");
            assert.strictEqual(doc.actualPrice, 20);
            assert.strictEqual(doc.pickupLocation, "McCormick");
            done();
          });
        });
      });

      it("should reject grocery stores not covered under our project", function(done) {
        var pending_delivery_fail = JSON.parse(JSON.stringify(pending_delivery1)); // deep copy
        pending_delivery_fail.stores = ["HMart", "laVerdes", "Star Market"];
        Delivery.create(pending_delivery_fail, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should reject statuses not covered under our project", function(done) {
        var claimed_delivery_fail = JSON.parse(JSON.stringify(claimed_delivery1)); // deep copy
        claimed_delivery_fail.status = "other";
        Delivery.create(claimed_delivery_fail, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should not allow requester and shopper to be the same", function(done) {
        var claimed_delivery_fail = JSON.parse(JSON.stringify(claimed_delivery1)); // deep copy
        claimed_delivery_fail.shopper = id2;
        Delivery.create(claimed_delivery_fail, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should not allow pickup time to be after the deadline", function(done) {
        var accepted_delivery_fail = JSON.parse(JSON.stringify(accepted_delivery1)); // deep copy
        accepted_delivery_fail.pickupTime = new Date('2016-11-24T11:00:30');
        Delivery.create(accepted_delivery_fail, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should not let estimatedPrice be negative", function(done) {
        var pending_delivery_fail = JSON.parse(JSON.stringify(pending_delivery1)); // deep copy
        pending_delivery_fail.estimatedPrice = -10;
        Delivery.create(pending_delivery_fail, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should not let tips be negative", function(done) {
        var rejected_delivery_fail = JSON.parse(JSON.stringify(rejected_delivery1)); // deep copy
        rejected_delivery_fail.tips = -2;
        Delivery.create(rejected_delivery_fail, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should not let actualPrice be negative", function(done) {
        var accepted_delivery_fail = JSON.parse(JSON.stringify(accepted_delivery1)); // deep copy
        accepted_delivery_fail.actualPrice = -15.5;
        Delivery.create(accepted_delivery_fail, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should reject pickup locations not covered under our project", function(done) {
        var rejected_delivery_fail = JSON.parse(JSON.stringify(rejected_delivery1)); // deep copy
        rejected_delivery_fail.pickupLocation = "Student Center";
        Delivery.create(rejected_delivery_fail, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should have an integer requesterRating ranged from 1-5 (or null)", function(done) {
        var rejected_delivery_fail = JSON.parse(JSON.stringify(rejected_delivery1)); // deep copy
        rejected_delivery_fail.requesterRating = 6;
        Delivery.create(rejected_delivery_fail, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should have an integer shopperRating ranged from 1-5 (or null)", function(done) {
        var rejected_delivery_fail = JSON.parse(JSON.stringify(rejected_delivery1)); // deep copy
        rejected_delivery_fail.shopperRating = 4.5;
        Delivery.create(rejected_delivery_fail, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

    }); //End Describe Basic Model and Validation

    describe("Cancel", function() {
      it("should allow users to cancel pending requests", function(done) {
        Delivery.create(pending_delivery1, function(err, doc) {
          Delivery.cancel(doc._id, id1, function(err) {
            assert.isNull(err);
            Delivery.find({itemName: "test-item-beer"}, function(err, deliveries) {
              assert.strictEqual(deliveries.length, 0);
              done();
            });
          });
        });
      });

      it("should not allow users to cancel claimed requests", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
          Delivery.cancel(doc._id, id2, function(err) {
            Delivery.find({itemName: "test-item-sausages"}, function(err, deliveries) {
              assert.strictEqual(deliveries.length, 1);
              done();
            });
          });
        });
      });

      it("should not allow other users besides requester to cancel pending requests", function(done) {
        Delivery.create(pending_delivery1, function(err, doc) {
          Delivery.cancel(doc._id, id2, function(err) {
            Delivery.find({itemName: "test-item-beer"}, function(err, deliveries) {
              assert.strictEqual(deliveries.length, 1);
              done();
            });
          });
        });
      });
    }); //End Describe Cancel function

    describe("SeeExpired", function() {
      it("should allow users to mark expired pending requests as seen", function(done) {
        var now = Date.now();
        var pastDeadline = new Date(now - 60*60*24*7*1000); //one week before now
        var pending_delivery_expired = JSON.parse(JSON.stringify(pending_delivery1)); // deep copy
        pending_delivery_expired.deadline = pastDeadline;
        Delivery.create(pending_delivery_expired, function(err, doc) {
          Delivery.seeExpired(doc._id, id1, function(err) {
            Delivery.findOne({itemName: "test-item-beer"}, function(err, current_delivery) {
              assert.strictEqual(current_delivery.seenExpired, true);
              done();
            });
          });
        });
      });

      it("should not allow users to mark non-expired pending requests as seen", function(done) {
        var now = Date.now();
        var futureDeadline = new Date(now + 60*60*24*7*1000); //one week after now
        var pending_delivery_fail = JSON.parse(JSON.stringify(pending_delivery1)); // deep copy
        pending_delivery_fail.deadline = futureDeadline;
        Delivery.create(pending_delivery_fail, function(err, doc) {
          Delivery.seeExpired(doc._id, id1, function(err) {
            assert.throws(function() {
              assert.ifError(err);
            });
            Delivery.findOne({itemName: "test-item-beer"}, function(err, current_delivery) {
              assert.strictEqual(current_delivery.seenExpired, false);
              done();
            });
          });
        });
      });
    }); //End Describe SeeExpired function

    describe("Claim", function() {
      it("should allow shoppers to claim requests", function(done) {
        var now = Date.now();
        var futureDeadline = new Date(now + 60*60*24*7*1000); //one week after now
        var pending_delivery_future = JSON.parse(JSON.stringify(pending_delivery1)); // deep copy
        pending_delivery_future.deadline = futureDeadline;
        Delivery.create(pending_delivery_future, function(err, doc) {
          Delivery.claim(doc._id, id2, function(err, current_delivery) {
            assert.strictEqual(current_delivery.shopper.username, "username2");
            assert.strictEqual(current_delivery.status, "claimed");
            done();
          });
        });
      });

      it("should not allow the requester to claim his own delivery", function(done) {
        var now = Date.now();
        var futureDeadline = new Date(now + 60*60*24*7*1000); //one week after now
        var pending_delivery_future = JSON.parse(JSON.stringify(pending_delivery1)); // deep copy
        pending_delivery_future.deadline = futureDeadline;
        Delivery.create(pending_delivery_future, function(err, doc) {
          Delivery.claim(doc._id, id1, function(err, current_delivery) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
      });

      it("should not allow a claimed delivery to be claimed again", function(done) {
        var now = Date.now();
        var futureDeadline = new Date(now + 60*60*24*7*1000); //one week after now
        var claimed_delivery_future = JSON.parse(JSON.stringify(claimed_delivery1)); // deep copy
        claimed_delivery_future.deadline = futureDeadline;
        Delivery.create(claimed_delivery_future, function(err, doc) {
          Delivery.claim(doc._id, id1, function(err, current_delivery) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
      });

      it("should not allow an expired delivery to be claimed", function(done) {
        var now = Date.now();
        var pastDeadline = new Date(now - 60*60*24*7*1000); //one week before now
        var pending_delivery_past = JSON.parse(JSON.stringify(pending_delivery1)); // deep copy
        pending_delivery_past.deadline = pastDeadline;
        Delivery.create(pending_delivery_past, function(err, doc) {
          Delivery.claim(doc._id, id2, function(err, current_delivery) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
      });

      it("should not allow shoppers with a rating below minShippingRating to claim the request", function(done) {
        var now = Date.now();
        var futureDeadline = new Date(now + 60*60*24*7*1000); //one week after now
        var pending_delivery_future = JSON.parse(JSON.stringify(pending_delivery1)); // deep copy
        pending_delivery_future.deadline = futureDeadline;
        pending_delivery_future.minShippingRating = 3;
        Delivery.create(pending_delivery_future, function(err, doc) {
          Delivery.claim(doc._id, id_rating_2, function(err, current_delivery) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
      });

      it("should not allow suspended shoppers to claim the request", function(done) {
        var now = Date.now();
        var futureDeadline = new Date(now + 60*60*24*7*1000); //one week after now
        var pending_delivery_future = JSON.parse(JSON.stringify(pending_delivery1)); // deep copy
        pending_delivery_future.deadline = futureDeadline;
        Delivery.create(pending_delivery_future, function(err, doc) {
          Delivery.claim(doc._id, id_suspended, function(err, current_delivery) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
      });
    }); //End Describe Claim function

    describe("Deliver", function() {
      it("should allow shoppers to deliver requests", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
          Delivery.deliver(doc._id, id1, new Date('2016-11-22T09:30:00'), 11, function(err, current_delivery) {
            assert.strictEqual(current_delivery.pickupTime.getTime(), new Date('2016-11-22T09:30:00').getTime());
            assert.strictEqual(current_delivery.actualPrice, 11);
            done();
          });
        });
      });

      it("should not allow shoppers to set pickup time after the deadline when delivering", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
          Delivery.deliver(doc._id, id1, new Date('2016-11-22T15:30:00'), 11, function(err, current_delivery) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
      });

      it("should not allow shoppers to set a negative actual price when delivering", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
          Delivery.deliver(doc._id, id1, new Date('2016-11-22T09:30:00'), -11, function(err, current_delivery) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
      });
    }); //End Describe Deliver function

    describe("Accept and Reject", function() {
      it("should allow requester to accept requests", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            doc.accept("testTransactionID", 5, function(err, newRating) {
              assert.strictEqual(doc.status, "accepted");
              assert.strictEqual(doc.shopperRating, 5);
              done();
            });
          });
      });

      it("should allow requester to reject requests", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
          Delivery.reject(doc._id, id2, 'Unsatisfied with the quality', 2, function(err, currentDelivery, newRating) {
            assert.strictEqual(currentDelivery.status, "rejected");
            assert.strictEqual(currentDelivery.shopperRating, 2);
            done();
          });
        });
      });

      it("should not allow requester to accept requests where actualPrice has not been set", function(done) {
        Delivery.create({stores: ["Trader Joe's"],
              status: "claimed",
              deadline: new Date('2016-11-22T10:30:00'),
              itemName: "test-item-sausages",
              itemDescription: "test-description-yuge",
              itemQuantity: "test-quantity-many",
              estimatedPrice: 8,
              tips: 1,
              pickupLocation: "New House",
              requester: id2,
              shopper: id1}, function(err, doc) {
                doc.accept("testTransactionID", 5, function(err, newRating) {
                  assert.throws(function() {
                    assert.ifError(err);
                  });
                  done();
              });
          });
      });

      it("should not allow requests not in the 'claimed' stage to be accepted", function(done) {
        Delivery.create(pending_delivery1, function(err, doc) {
            doc.accept("testTransactionID", 4, function(err, newRating) {
              assert.throws(function() {
                assert.ifError(err);
              });
              done();
            });
          });
      });

      it("should not allow requests not in the 'claimed' stage to be rejected", function(done) {
        Delivery.create(accepted_delivery1, function(err, doc) {
          Delivery.reject(doc._id, id3, 'Wrong item', 1, function(err, currentDelivery, newRating) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
      });

      it("should not allow empty reject reason", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
          Delivery.reject(doc._id, id2, '', 1, function(err, currentDelivery, newRating) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
      });

      it("should not allow invalid shopper rating when rejecting", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
          Delivery.reject(doc._id, id2, 'Wrong item', 0, function(err, currentDelivery, newRating) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
      });

      it("should not allow invalid shopper rating when accepting", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            doc.accept("testTransactionID", 10, function(err, newRating) {
              assert.throws(function() {
                assert.ifError(err);
              });
              done();
            });
          });
      });

      it("should not allow other users besides the requester to reject requests", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
          Delivery.reject(doc._id, id3, 'Unsatisfied with the quality', 2, function(err, currentDelivery, newRating) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
      });
    }); //End Describe Accept and Reject functions

    describe("RateRequester", function() {
      it("should allow shopper to rate requester after the delivery is accepted", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            doc.accept("testTransactionID", 3, function(err, newRating) {
              assert.isNull(err);
              Delivery.rateRequester(doc._id, id1, 4, function (err, newRating) {
                assert.isNull(err);
                Delivery.findOne({itemName: "test-item-sausages"}, function(err, currentDelivery) {
                  assert.isNull(err);
                  assert.strictEqual(currentDelivery.requesterRating, 4);
                  assert.strictEqual(currentDelivery.shopperRating, 3);
                  done();
                });
              });
            });
        });
      });

      it("should allow shopper to rate requester after the delivery is rejected", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            Delivery.reject(doc._id, id2, 'Wrong item', 3, function(err, doc, newRating) {
                assert.isNull(err);
                Delivery.rateRequester(doc._id, id1, 2, function(err, newRating) {
                  assert.isNull(err);
                  Delivery.findOne({itemName: "test-item-sausages"}, function(err, currentDelivery) {
                    assert.isNull(err);
                    assert.strictEqual(currentDelivery.requesterRating, 2);
                    assert.strictEqual(currentDelivery.shopperRating, 3);
                    done();
                  });
                });
            });
        });
      });

      it("should allow shopper to rate requester after the delivery is claimed", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
          Delivery.rateRequester(doc._id, id1, 1, function(err, newRating) {
            assert.isNull(err);
            Delivery.findOne({itemName: "test-item-sausages"}, function(err, currentDelivery) {
              assert.isNull(err);
              assert.strictEqual(currentDelivery.requesterRating, 1);
              done();
            });
          });
        });
      });

      it("should not allow other users besides the shopper to rate requester", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
          Delivery.rateRequester(doc._id, id2, 1, function(err, newRating) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
      });

    }); //End Describe RateRequester functions

    describe("getRequestsAndDeliveries", function() {
      it("should get pending requests of a user, where seenExpired is false", function(done) {
        Delivery.create(pending_delivery1, function(err, doc) {
            Delivery.getRequestsAndDeliveries(id1, function(err, requestItems, deliveryItems) {
              assert.strictEqual(requestItems.length, 1);
              assert.strictEqual(deliveryItems.length, 0);
              assert.strictEqual(requestItems[0].itemName, "test-item-beer");
              done();
            });
          });
      });

      it("should get claimed requests of a user", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            Delivery.getRequestsAndDeliveries(id2, function(err, requestItems, deliveryItems) {
              assert.strictEqual(requestItems.length, 1);
              assert.strictEqual(deliveryItems.length, 0);
              assert.strictEqual(requestItems[0].itemName, "test-item-sausages");
              assert.strictEqual(requestItems[0].shopper.username, "username1");
              done();
            });
          });
      });

      it("should get deliveries that a user has claimed but not gave a requesterRating", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            Delivery.getRequestsAndDeliveries(id1, function(err, requestItems, deliveryItems) {
              assert.strictEqual(requestItems.length, 0);
              assert.strictEqual(deliveryItems.length, 1);
              assert.strictEqual(deliveryItems[0].itemName, "test-item-sausages");
              assert.strictEqual(deliveryItems[0].requester.username, "username2");
              done();
            });
          });
      });

      it("should not get requests and deliveries of other users", function(done) {
        Delivery.create([pending_delivery1, claimed_delivery1], function(err, doc) {
            Delivery.getRequestsAndDeliveries(id3, function(err, requestItems, deliveryItems) {
              assert.strictEqual(requestItems.length, 0);
              assert.strictEqual(deliveryItems.length, 0);
              done();
            });
          });
      });

      it("should not get pending requests where seenExpired is true", function(done) {
        Delivery.create({stores: ["HMart", "Star Market"],
              status: "pending",
              deadline: new Date('2016-11-21T23:59:59'),
              itemName: "test-item-beer",
              itemDescription: "test-description-bluegirl",
              itemQuantity: "test-quantity-6",
              estimatedPrice: 3.5,
              tips: 0.5,
              pickupLocation: "Baker",
              requester: id1,
              seenExpired: true}, function(err, doc) {
            Delivery.getRequestsAndDeliveries(id1, function(err, requestItems, deliveryItems) {
              assert.strictEqual(requestItems.length, 0);
              assert.strictEqual(deliveryItems.length, 0);
              done();
            });
          });
      });

      it("should not get requests that a user has accepted or rejected", function(done) {
        Delivery.create([rejected_delivery1,
                           {stores: ["Whole Foods", "Trader Joe's"],
              status: "accepted",
              deadline: new Date('2016-11-23T11:00:30'),
              itemName: "test-item-icecream",
              itemDescription: "test-description-talenti",
              itemQuantity: "test-quantity-1",
              estimatedPrice: 15.50,
              tips: 2,
              pickupLocation: "McCormick",
              requester: id2,
              shopper: id3, 
              actualPrice: 14,
              pickupTime: new Date('2016-11-22T23:00:59')}], function(err, doc) {
            Delivery.getRequestsAndDeliveries(id2, function(err, requestItems, deliveryItems) {
              assert.strictEqual(requestItems.length, 0);
              assert.strictEqual(deliveryItems.length, 0);
              done();
            });
          });
      });

      it("should not get deliveries where the user has already given a requesterRating", function(done) {
        Delivery.create(rejected_delivery1, function(err, doc) {
            Delivery.getRequestsAndDeliveries(id1, function(err, requestItems, deliveryItems) {
              assert.strictEqual(requestItems.length, 0);
              assert.strictEqual(deliveryItems.length, 0);
              done();
            });
          });
      });
    }); //End Describe getRequestsAndDeliveries function

    describe("getRequests", function() {
      it("should populate pending requests that are not requested by the current user", function(done) {
        Delivery.create(pending_delivery1, function(err, doc) {
            Delivery.getRequests(id2, new Date('2016-11-20T15:00:00'), ["HMart", "Trader Joe's", "Whole Foods"], null, null, null, function(err, requestItems) {
              assert.strictEqual(requestItems.length, 1);
              assert.strictEqual(requestItems[0].itemName, "test-item-beer");
              assert.strictEqual(requestItems[0].requester.username, "username1");
              done();
            });
          });
      });

      it("should not populate pending requests that are requested by the current user", function(done) {
        Delivery.create(pending_delivery1, function(err, doc) {
            Delivery.getRequests(id1, new Date('2016-11-20T15:00:00'), ["HMart", "Trader Joe's", "Whole Foods"], null, null, null, function(err, requestItems) {
              assert.strictEqual(requestItems.length, 0);
              done();
            });
          });
      });

      it("should not populate requests that are not pending", function(done) {
        Delivery.create([claimed_delivery1, accepted_delivery1], function(err, doc) {
            Delivery.getRequests(id1, new Date('2016-11-22T08:00:00'), ["HMart", "Trader Joe's", "Whole Foods"], ["McCormick", "New House"], null, null, function(err, requestItems) {
              assert.strictEqual(requestItems.length, 0);
              done();
            });
          });
      });

      it("should not populate requests whose deadlines have passed", function(done) {
        Delivery.create(pending_delivery1, function(err, doc) {
            Delivery.getRequests(id2, new Date('2016-11-22T10:00:00'), null, ["Lobby 7", "Baker"], null, null, function(err, requestItems) {
              assert.strictEqual(requestItems.length, 0);
              done();
            });
          });
      });

      it("should not populate requests from stores outside of the filter list of stores", function(done) {
        Delivery.create(pending_delivery1, function(err, doc) {
            Delivery.getRequests(id2, new Date('2016-11-21T12:00:00'), ["Trader Joe's", "Whole Foods"], ["Lobby 7", "Baker"], null, null, function(err, requestItems) {
              assert.strictEqual(requestItems.length, 0);
              done();
            });
          });
      });

      it("should not populate requests with pickup locations outside of the filter list of locations", function(done) {
        Delivery.create(pending_delivery1, function(err, doc) {
            Delivery.getRequests(id2, new Date('2016-11-21T12:00:00'), ["Trader Joe's", "HMart"], ["Lobby 7", "Burton Conner"], null, null, function(err, requestItems) {
              assert.strictEqual(requestItems.length, 0);
              done();
            });
          });
      });

      it("should not populate requests where requester's avgRequestRating is below the minRating", function(done) {
        Delivery.create([{stores: ["Star Market", "Whole Foods"],
          status: "pending",
          deadline: new Date('2016-11-23T23:59:59'),
          itemName: "test-item-chips",
          itemDescription: "test-description-crunchy",
          itemQuantity: "test-quantity-many",
          estimatedPrice: 5,
          tips: 0.25,
          pickupLocation: "MacGregor",
          requester: id_rating_5},
                          {stores: ["Star Market", "Whole Foods"],
          status: "pending",
          deadline: new Date('2016-11-23T23:59:59'),
          itemName: "test-item-yoghurt",
          itemDescription: "test-description-yummy",
          itemQuantity: "test-quantity-many",
          estimatedPrice: 6,
          tips: 0.2,
          pickupLocation: "Baker",
          requester: id_rating_2}], function(err, doc) {
            Delivery.getRequests(id3, new Date('2016-11-21T12:00:00'), null, null, 4, null, function(err, requestItems) {
              assert.strictEqual(requestItems.length, 1);
              assert.strictEqual(requestItems[0].itemName, "test-item-chips");
              done();
            });
          });
      });

      it("should sort pending requests in the correct order", function(done) {
        Delivery.create([pending_delivery1,
                          {stores: ["Star Market", "Whole Foods"],
          status: "pending",
          deadline: new Date('2016-11-23T23:59:59'),
          itemName: "test-item-yoghurt",
          itemDescription: "test-description-yummy",
          itemQuantity: "test-quantity-many",
          estimatedPrice: 6,
          tips: 0.2,
          pickupLocation: "Baker",
          requester: id2},
                          {stores: ["HMart"],
          status: "pending",
          deadline: new Date('2016-11-24T10:00:00'),
          itemName: "test-item-pie",
          itemDescription: "test-description-delicious",
          itemQuantity: "test-quantity-big",
          estimatedPrice: 8,
          tips: 1,
          pickupLocation: "Baker",
          requester: id2}], function(err, doc) {
            Delivery.getRequests(id3, new Date('2016-11-21T15:00:00'), null, null, null, ["tips", -1], function(err, requestItems) {
              assert.strictEqual(requestItems.length, 3);
              assert.strictEqual(requestItems[0].itemName, "test-item-pie");
              assert.strictEqual(requestItems[1].itemName, "test-item-beer");
              assert.strictEqual(requestItems[2].itemName, "test-item-yoghurt");
              Delivery.getRequests(id3, new Date('2016-11-21T15:00:00'), null, null, null, ["tips", 1], function(err, requestItems) {
                assert.strictEqual(requestItems.length, 3);
                assert.strictEqual(requestItems[0].itemName, "test-item-yoghurt");
                assert.strictEqual(requestItems[1].itemName, "test-item-beer");
                assert.strictEqual(requestItems[2].itemName, "test-item-pie");
                done();
              });
            });
          });
      });
    }); //End Describe getRequests function

  }); //End describe Delivery
}); // End describe App.
