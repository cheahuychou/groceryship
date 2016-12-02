//Author: Joseph Kuan
var assert = require('chai').assert;
var mongoose = require("mongoose");
var User = require('../models/user');
var Delivery = require('../models/delivery');

describe("Models", function() {
  // The mongoose connection object.
  var con;

  // ids of the default test users
  var id1, id2, id3;

  // Some default deliveries
  var pending_delivery1, claimed_delivery1, rejected_delivery1, accepted_delivery1;

  // Before running any test, connect to the database & drop database. Also, create some test users and deliveries
  before(function(done) {
    con = mongoose.connect("mongodb://localhost/grocerydb-delivery-test", function() {

      con.connection.db.dropDatabase(function() {

        var testUser1 = new User({
          "username": "username1",
          "password": "something1",
          "firstName": "firstName1",
          "lastName": "lastName1",
          "phoneNumber": 1234567890,
          "dorm": "Baker",
          "stripeId":"testuserStripeId",
          "stripeEmail": "testuserStripeEmail",
          "avgRequestRating": 4
        });

        var testUser2 = new User({
          "username": "username2",
          "password": "something2",
          "firstName": "firstName2",
          "lastName": "lastName2",
          "phoneNumber": 2345678901,
          "dorm": "MacGregor",
          "stripeId":"testuserStripeId",
          "stripeEmail": "testuserStripeEmail",
          "avgRequestRating": 3.5
        });

        var testUser3 = new User({
          "username": "username3",
          "password": "something3",
          "firstName": "firstName3",
          "lastName": "lastName3",
          "phoneNumber": 3456789012,
          "dorm": "New House",
          "stripeId":"testuserStripeId",
          "stripeEmail": "testuserStripeEmail"
        });

        User.create([testUser1, testUser2, testUser3], function(err, users) {
          if (err) {
            console.log("Default users not created");
            console.log(err.message);
          }

          id1 = users[0]._id;
          id2 = users[1]._id;
          id3 = users[2]._id;

          pending_delivery1 = {stores: ["HMart", "Star Market"],
              status: "pending",
              deadline: new Date('2016-11-21T23:59:59'),
              itemName: "test-item-beer",
              itemDescription: "test-description-bluegirl",
              itemQuantity: "test-quantity-6",
              estimatedPrice: 3.5,
              tips: 0.5,
              pickupLocation: "Baker",
              requester: id1,
              seenExpired: false};

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
              seenExpired: false};

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
              shopper: id1};

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
            assert.strictEqual(doc.itemDescription, "test-description-bluegirl");
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
        Delivery.create({stores: ["HMart", "laVerdes", "Star Market"],
          status: "pending",
          deadline: new Date('2016-11-21T23:59:59'),
          itemName: "test-item",
          itemDescription: "test-description",
          itemQuantity: "test-quantity",
          estimatedPrice: 10,
          tips: 0.75,
          pickupLocation: "Baker",
          requester: id1}, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should reject statuses not covered under our project", function(done) {
        Delivery.create({stores: ["HMart", "Star Market"],
          status: "other",
          deadline: new Date('2016-11-21T11:59:59'),
          itemName: "test-item",
          itemDescription: "test-description",
          itemQuantity: "test-quantity",
          estimatedPrice: 10,
          tips: 0.75,
          pickupLocation: "Baker",
          requester: id1}, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should not allow requester and shopper to be the same", function(done) {
        User.findOne({username: "username1"}, '_id', function(err, user1) {
          Delivery.create({stores: ["Star Market"],
            status: "claimed",
            deadline: new Date('2016-11-21T11:59:59'),
            itemName: "test-item",
            itemDescription: "test-description",
            itemQuantity: "test-quantity",
            estimatedPrice: 10,
            tips: 0.75,
            pickupLocation: "Baker",
            requester: id1,
            shopper: user1._id, 
            actualPrice: 11.5}, function(err, doc) {
              assert.throws(function() {
                assert.ifError(err);
              });
              done();
            });
        });
      });

      it("should not allow pickup time to be after the deadline", function(done) {
        Delivery.create({stores: ["Whole Foods"],
          status: "accepted",
          deadline: new Date('2016-11-21T11:59:59'),
          itemName: "test-item",
          itemDescription: "test-description",
          itemQuantity: "test-quantity",
          estimatedPrice: 10,
          tips: 0.75,
          pickupLocation: "Baker",
          requester: id1,
          shopper: id2, 
          actualPrice: 11.5,
          pickupTime: new Date('2016-11-21T12:30:00')}, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should not let estimatedPrice be negative", function(done) {
        Delivery.create({stores: ["HMart", "Star Market"],
          status: "accepted",
          deadline: new Date('2016-11-22T23:59:59'),
          itemName: "cheese",
          itemDescription: "cheddar",
          itemQuantity: "100g",
          estimatedPrice: -15,
          tips: 2,
          pickupLocation: "Student Center",
          requester: id1}, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should not let tips be negative", function(done) {
        Delivery.create({stores: ["HMart", "Star Market"],
          status: "accepted",
          deadline: new Date('2016-11-22T23:59:59'),
          itemName: "cheese",
          itemDescription: "cheddar",
          itemQuantity: "100g",
          estimatedPrice: 15,
          tips: -2,
          pickupLocation: "Student Center",
          requester: id1}, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should not let actualPrice be negative", function(done) {
        Delivery.create({stores: ["Whole Foods"],
          status: "accepted",
          deadline: new Date('2016-11-22T12:00:00'),
          itemName: "test-item",
          itemDescription: "test-description",
          itemQuantity: "test-quantity",
          estimatedPrice: 10,
          tips: 0.75,
          pickupLocation: "Baker",
          requester: id1,
          shopper: id2, 
          actualPrice: -11.5,
          pickupTime: new Date('2016-11-21T11:00:00')}, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should reject pickup locations not covered under our project", function(done) {
        Delivery.create({stores: ["HMart", "Star Market"],
          status: "accepted",
          deadline: new Date('2016-11-22T23:59:59'),
          itemName: "cheese",
          itemDescription: "cheddar",
          itemQuantity: "100g",
          estimatedPrice: 15,
          tips: 2,
          pickupLocation: "Student Center",
          requester: id1}, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should have an integer requesterRating ranged from 1-5 (or null)", function(done) {
        Delivery.create({stores: ["Whole Foods"],
          status: "accepted",
          deadline: new Date('2016-11-22T12:00:00'),
          itemName: "test-item",
          itemDescription: "test-description",
          itemQuantity: "test-quantity",
          estimatedPrice: 10,
          tips: 0.75,
          pickupLocation: "Baker",
          requester: id1,
          shopper: id2, 
          actualPrice: -11.5,
          pickupTime: new Date('2016-11-21T11:00:00'),
          requesterRating: 6}, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

      it("should have an integer shopperRating ranged from 1-5 (or null)", function(done) {
        Delivery.create({stores: ["Whole Foods"],
          status: "accepted",
          deadline: new Date('2016-11-22T12:00:00'),
          itemName: "test-item",
          itemDescription: "test-description",
          itemQuantity: "test-quantity",
          estimatedPrice: 10,
          tips: 0.75,
          pickupLocation: "Baker",
          requester: id1,
          shopper: id2, 
          actualPrice: -11.5,
          pickupTime: new Date('2016-11-21T11:00:00'),
          requesterRating: 4.5}, function(err, doc) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
      });

    }); //End Describe Basic Model and Validation

    describe("SeenExpired", function() {
      it("should allow users to mark expired pending requests as seen", function(done) {
        Delivery.create(pending_delivery1, function(err, doc) {
            doc.seeExpired(function(err) {
              assert.strictEqual(doc.seenExpired, true);
              done();
            });
          });
      });
    }); //End Describe Deliver function

    describe("Claim", function() {
      it("should allow shoppers to claim requests", function(done) {
        Delivery.create(pending_delivery1, function(err, doc) {
            doc.claim(id2, function(err) {
              assert.strictEqual(doc.shopper.toString(), id2.toString());
              assert.strictEqual(doc.status, "claimed");
              done();
            })
          });
      });

      it("should not allow the requester to claim his own delivery", function(done) {
        User.findOne({username: "username1"}, '_id', function(err, user1) {
          Delivery.create(pending_delivery1, function(err, doc) {
              doc.claim(user1._id, function(err) {
                assert.throws(function() {
                  assert.ifError(err);
                });
                done();
              });
            });
        });
      });

      it("should not allow a claimed delivery to be claimed again", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            doc.claim(id1, function(err) {
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
            doc.deliver(new Date('2016-11-22T14:30:00'), 11, function(err) {
              assert.strictEqual(doc.pickupTime.getTime(), new Date('2016-11-22T14:30:00').getTime());
              assert.strictEqual(doc.actualPrice, 11);
              done();
            });
          });
      });
    }); //End Describe Deliver function

    describe("Accept, Reject, and RateRequester", function() {
      it("should allow requester to accept requests", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            doc.accept(5, function(err) {
              assert.strictEqual(doc.status, "accepted");
              assert.strictEqual(doc.shopperRating, 5);
              done();
            });
          });
      });

      it("should allow requester to reject requests", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            doc.reject('Unsatsified with the quality', 2, function(err) {
              assert.strictEqual(doc.status, "rejected");
              assert.strictEqual(doc.shopperRating, 2);
              done();
            });
          });
      });

      it("should not allow requests not in the 'claimed' stage to be accepted", function(done) {
        Delivery.create(pending_delivery1, function(err, doc) {
            doc.accept(4, function(err) {
              assert.throws(function() {
                assert.ifError(err);
              });
              done();
            });
          });
      });

      it("should not allow requests not in the 'claimed' stage to be rejected", function(done) {
        Delivery.create(accepted_delivery1, function(err, doc) {
            doc.reject('Wrong item', 1, function(err) {
              assert.throws(function() {
                assert.ifError(err);
              });
              done();
            });
          });
      });

      it("should not allow empty reject reason", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            doc.reject('', 1, function(err) {
              assert.isNotNull(err);
              done();
            });
          });
      });

      it("should not allow invalid shopper rating", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            doc.reject('Wrong item', -1, function(err) {
              assert.isNotNull(err);
              done();
            });
          });
      });

      it("should not allow invalid requester rating", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            doc.accept(10, function(err) {
              assert.isNotNull(err);
              done();
            });
          });
      });

      it("should allow shopper to rate requester after the delivery is accepted", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            doc.accept(4, function(err) {
              assert.isNull(err);
              doc.rateRequester(4, function (err) {
                assert.isNull(err);
                assert.strictEqual(doc.requesterRating, 4);
                done();
              })
            });
          });
      });

      it("should allow shopper to rate requester after the delivery is rejected", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            console.log('yo')
            doc.reject('Wrong item', 3, function(err) {
                assert.isNull(err);
                doc.rateRequester(2, function (err) {
                    assert.isNull(err);
                    assert.strictEqual(doc.requesterRating, 2);
                    done();
                })
            });
          });
      });

      it("should allow shopper to rate requester after the delivery is claimed", function(done) {
        Delivery.create(claimed_delivery1, function(err, doc) {
            doc.reject('Wrong item', 3, function(err) {
              assert.isNull(err);
              doc.rateRequester(2, function (err) {
                assert.isNull(err);
                assert.strictEqual(doc.requesterRating, 2);
                done();
              })
            });
          });
      });

      it("should not allow shopper to rate requester without claiming the delivery", function(done) {
        Delivery.create(pending_delivery1, function(err, doc) {
            doc.rateRequester(2, function (err) {
                assert.isNotNull(err);
                done();
            })
          });
      });

    }); //End Describe Accept and Reject functions

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
          requester: id2}], function(err, doc) {
            Delivery.getRequests(id1, new Date('2016-11-23T15:00:00'), ["HMart", "Trader Joe's", "Whole Foods"], null, null, null, function(err, requestItems) {
              assert.strictEqual(requestItems.length, 1);
              assert.strictEqual(requestItems[0].itemName, "test-item-yoghurt");
              assert.strictEqual(requestItems[0].requester.phoneNumber, 2345678901);
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
          requester: id2}], function(err, doc) {
            Delivery.getRequests(id3, new Date('2016-11-21T12:00:00'), null, null, 4, null, function(err, requestItems) {
              assert.strictEqual(requestItems.length, 1);
              assert.strictEqual(requestItems[0].itemName, "test-item-beer");
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
