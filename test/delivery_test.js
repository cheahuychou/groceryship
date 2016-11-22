var assert = require("assert");
var mongoose = require("mongoose");
var User = require('../models/user');
var Delivery = require('../models/delivery');

describe("App", function() {
  // The mongoose connection object.
  var con

  // The ids of the test users
  var id1, id2, id3;

  // Before running any test, connect to the database. Also, create some test users
  before(function(done) {
    con = mongoose.connect("mongodb://localhost/grocerydb-test", function() {
      var testUser1 = new User({
        "username": "username1",
        "password": "something1",
        "mitId": 123456789,
        "phoneNumber": 1234567890,
        "dorm": "Baker"
      });

      var testUser2 = new User({
        "username": "username2",
        "password": "something2",
        "mitId": 234567890,
        "phoneNumber": 2345678901,
        "dorm": "MacGregor"
      });

      var testUser3 = new User({
        "username": "username3",
        "password": "something3",
        "mitId": 345678901,
        "phoneNumber": 3456789012,
        "dorm": "New House"
      });

      User.create([testUser1, testUser2, testUser3], function(err, user) {
        id1 = user[0]._id;
        id2 = user[1]._id;
        id3 = user[2]._id;
        done();
      });
    });
  });

  // Delete the deliveries collection before each test.
  beforeEach(function(done) {
    con.connection.db.dropCollection("deliveries", function() { done(); });
  });

  describe("Delivery", function() {

    it("should have minimum required fields of a delivery", function(done) {
      Delivery.create({stores: ["HMart"],
        status: "pending",
        deadline: new Date('2016-11-21T23:59:59'),
        itemName: "test-item",
        itemDescription: "test-description",
        itemQuantity: "test-quantity",
        estimatedPrice: 3.5,
        tips: 0.5,
        pickupLocation: "Baker",
        requester: id1}, function() {
        Delivery.findOne({"itemName": "test-item"}, function(err, doc) {
          assert.strictEqual(doc.itemDescription, "test-description");
          assert.strictEqual(doc.estimatedPrice, 3.5);
          assert.strictEqual(doc.itemQuantity, "test-quantity");
          done();
        });
      });
    });

    it("should have all fields of a delivery present in the design model", function(done) {
      Delivery.create({stores: ["Whole Foods", "Trader Joe's", "Star Market", "HMart"],
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
        pickupTime: new Date('2016-11-21T23:00:59')},function() {
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
        shopper: id1, 
        actualPrice: 11.5}, function(err, doc) {
          assert.throws(function() {
            assert.ifError(err);
          });
          done();
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

    it("should allow shoppers to claim requests", function(done) {
      Delivery.create({stores: ["Whole Foods"],
        status: "pending",
        deadline: new Date('2016-11-21T11:59:59'),
        itemName: "test-item",
        itemDescription: "test-description",
        itemQuantity: "test-quantity",
        estimatedPrice: 10,
        tips: 0.75,
        pickupLocation: "Baker",
        requester: id1}, function(err, doc) {
          doc.claim(id2, function(err) {
            assert.strictEqual(doc.shopper.toString(), id2.toString());
            done();
          })
        });
    });

    it("should not allow the requester to claim a delivery", function(done) {
      Delivery.create({stores: ["Star Market"],
        status: "pending",
        deadline: new Date('2016-11-22T10:59:59'),
        itemName: "test-item",
        itemDescription: "test-description",
        itemQuantity: "test-quantity",
        estimatedPrice: 5,
        tips: 0,
        pickupLocation: "Maseeh",
        requester: id2}, function(err, doc) {
          doc.claim(id2, function(err) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
    });

    it("should not allow a claimed delivery to be claimed again", function(done) {
      Delivery.create({stores: ["Trader Joe's"],
        status: "claimed",
        deadline: new Date('2016-11-22T10:30:00'),
        itemName: "test-item",
        itemDescription: "test-description",
        itemQuantity: "test-quantity",
        estimatedPrice: 8,
        tips: 1,
        pickupLocation: "New House",
        requester: id2,
        shopper: id1}, function(err, doc) {
          doc.claim(id1, function(err) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
    });

    it("should allow shoppers to deliver requests", function(done) {
      Delivery.create({stores: ["HMart"],
        status: "claimed",
        deadline: new Date('2016-11-22T15:59:59'),
        itemName: "test-item",
        itemDescription: "test-description",
        itemQuantity: "test-quantity",
        estimatedPrice: 10.5,
        tips: 0.5,
        pickupLocation: "Next House",
        requester: id1,
        shopper: id2}, function(err, doc) {
          doc.deliver(new Date('2016-11-22T14:30:00'), 11, function(err) {
            assert.strictEqual(doc.pickupTime.getTime(), new Date('2016-11-22T14:30:00').getTime());
            assert.strictEqual(doc.actualPrice, 11);
            done();
          });
        });
    });

    it("should allow requester to accept requests", function(done) {
      Delivery.create({stores: ["HMart"],
        status: "claimed",
        deadline: new Date('2016-11-22T20:59:59'),
        itemName: "test-item",
        itemDescription: "test-description",
        itemQuantity: "test-quantity",
        estimatedPrice: 12,
        tips: 0.5,
        pickupLocation: "MacGregor",
        requester: id1,
        shopper: id2,
        actualPrice: 11,
        pickupTime: new Date('2016-11-22T14:30:00')}, function(err, doc) {
          doc.accept(function(err) {
            assert.strictEqual(doc.status, "accepted");
            done();
          });
        });
    });

    it("should allow requester to reject requests", function(done) {
      Delivery.create({stores: ["Star Market"],
        status: "claimed",
        deadline: new Date('2016-11-22T23:59:59'),
        itemName: "test-item",
        itemDescription: "test-description",
        itemQuantity: "test-quantity",
        estimatedPrice: 12,
        tips: 0.5,
        pickupLocation: "MacGregor",
        requester: id1,
        shopper: id2,
        actualPrice: 50,
        pickupTime: new Date('2016-11-22T14:50:00')}, function(err, doc) {
          doc.reject(function(err) {
            assert.strictEqual(doc.status, "rejected");
            done();
          });
        });
    });

    it("should not allow requests not in the 'claimed' stage to be accepted", function(done) {
      Delivery.create({stores: ["HMart"],
        status: "pending",
        deadline: new Date('2016-11-22T20:59:59'),
        itemName: "test-item",
        itemDescription: "test-description",
        itemQuantity: "test-quantity",
        estimatedPrice: 12,
        tips: 0.5,
        pickupLocation: "MacGregor",
        requester: id1}, function(err, doc) {
          doc.accept(function(err) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
    });

    it("should not allow requests not in the 'claimed' stage to be rejected", function(done) {
      Delivery.create({stores: ["Trader Joe's"],
        status: "accepted",
        deadline: new Date('2016-11-23T18:59:59'),
        itemName: "test-item",
        itemDescription: "test-description",
        itemQuantity: "test-quantity",
        estimatedPrice: 12,
        tips: 0.5,
        pickupLocation: "MacGregor",
        requester: id1,
        shopper: id2,
        actualPrice: 12,
        pickupTime: new Date('2016-11-23T12:00:00')}, function(err, doc) {
          doc.reject(function(err) {
            assert.throws(function() {
              assert.ifError(err);
            });
            done();
          });
        });
    });

    it("should get requests and deliveries of a user", function(done) {
      Delivery.create([{stores: ["Trader Joe's"],
        status: "pending",
        deadline: new Date('2016-11-23T18:59:59'),
        itemName: "test-item-sausages",
        itemDescription: "test-description-yuge",
        itemQuantity: "test-quantity-3",
        estimatedPrice: 12,
        tips: 0.5,
        pickupLocation: "MacGregor",
        requester: id1},
                       {stores: ["Star Market"],
        status: "claimed",
        deadline: new Date('2016-11-23T23:59:59'),
        itemName: "test-item-yoghurt",
        itemDescription: "test-description-yummy",
        itemQuantity: "test-quantity-many",
        estimatedPrice: 5,
        tips: 0.2,
        pickupLocation: "Baker",
        requester: id2,
        shopper: id1,
        actualPrice: 6,
        pickupTime: new Date('2016-11-23T12:00:00')}], function(err, doc) {
          Delivery.getRequestsAndDeliveries(id1, new Date('2016-11-23T13:00:00'), function(err, requestItems, deliveryItems) {
            assert.strictEqual(requestItems.length, 1);
            assert.strictEqual(deliveryItems.length, 1);
            assert.strictEqual(requestItems[0].itemName, "test-item-sausages");
            assert.strictEqual(deliveryItems[0].itemName, "test-item-yoghurt");
            assert.strictEqual(deliveryItems[0].requester.username, "username2");
            assert.strictEqual(deliveryItems[0].requester.mitId, 234567890);
            done();
          });
        });
    });

    it("should not get requests and deliveries whose deadlines have passed", function(done) {
      Delivery.create([{stores: ["Trader Joe's"],
        status: "pending",
        deadline: new Date('2016-11-23T18:59:59'),
        itemName: "test-item-sausages",
        itemDescription: "test-description-yuge",
        itemQuantity: "test-quantity-3",
        estimatedPrice: 12,
        tips: 0.5,
        pickupLocation: "MacGregor",
        requester: id1}, 
                       {stores: ["Star Market"],
        status: "claimed",
        deadline: new Date('2016-11-23T23:59:59'),
        itemName: "test-item-yoghurt",
        itemDescription: "test-description-yummy",
        itemQuantity: "test-quantity-many",
        estimatedPrice: 5,
        tips: 0.2,
        pickupLocation: "Baker",
        requester: id2,
        shopper: id1,
        actualPrice: 6,
        pickupTime: new Date('2016-11-23T12:00:00')}], function(err, doc) {
          Delivery.getRequestsAndDeliveries(id1, new Date('2016-11-24T02:00:00'), function(err, requestItems, deliveryItems) {
            assert.strictEqual(requestItems.length, 0);
            assert.strictEqual(deliveryItems.length, 0);
            done();
          });
        });
    });

    it("should not get requests and deliveries that are not pending or claimed", function(done) {
      Delivery.create([{stores: ["Whole Foods"],
        status: "accepted",
        deadline: new Date('2016-11-23T18:59:59'),
        itemName: "test-item-blueberries",
        itemDescription: "test-description-yuge",
        itemQuantity: "test-quantity-3",
        estimatedPrice: 12,
        tips: 0.5,
        pickupLocation: "Lobby 7",
        requester: id1,
        shopper: id3,
        actualPrice: 13,
        pickupTime: new Date('2016-11-23T17:00:00')},
                        {stores: ["Star Market"],
        status: "rejected",
        deadline: new Date('2016-11-23T23:59:59'),
        itemName: "test-item-yoghurt",
        itemDescription: "test-description-yummy",
        itemQuantity: "test-quantity-many",
        estimatedPrice: 6,
        tips: 0.2,
        pickupLocation: "Baker",
        requester: id2,
        shopper: id1,
        actualPrice: 6,
        pickupTime: new Date('2016-11-23T20:00:00')}], function(err, doc) {
          Delivery.getRequestsAndDeliveries(id1, new Date('2016-11-23T15:00:00'), function(err, requestItems, deliveryItems) {
            assert.strictEqual(requestItems.length, 0);
            assert.strictEqual(deliveryItems.length, 0);
            done();
          });
        });
    });

    it("should populate pending requests that are not requested by the current user", function(done) {
      Delivery.create([{stores: ["Whole Foods"],
        status: "pending",
        deadline: new Date('2016-11-23T18:59:59'),
        itemName: "test-item-blueberries",
        itemDescription: "test-description-yuge",
        itemQuantity: "test-quantity-3",
        estimatedPrice: 12,
        tips: 0.5,
        pickupLocation: "Lobby 7",
        requester: id1},
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
          Delivery.getRequests(id1, new Date('2016-11-23T15:00:00'), ["HMart", "Trader Joe's", "Whole Foods"], null, null, function(err, requestItems) {
            assert.strictEqual(requestItems.length, 1);
            assert.strictEqual(requestItems[0].itemName, "test-item-yoghurt");
            assert.strictEqual(requestItems[0].requester.phoneNumber, 2345678901);
            done();
          });
        });
    });

    it("should not populate requests that are not pending", function(done) {
      Delivery.create([{stores: ["Whole Foods"],
        status: "claimed",
        deadline: new Date('2016-11-23T18:59:59'),
        itemName: "test-item-blueberries",
        itemDescription: "test-description-yuge",
        itemQuantity: "test-quantity-3",
        estimatedPrice: 12,
        tips: 0.5,
        pickupLocation: "Lobby 7",
        requester: id3,
        shopper: id1},
                        {stores: ["Star Market", "Whole Foods"],
        status: "accepted",
        deadline: new Date('2016-11-23T23:59:59'),
        itemName: "test-item-yoghurt",
        itemDescription: "test-description-yummy",
        itemQuantity: "test-quantity-many",
        estimatedPrice: 6,
        tips: 0.2,
        pickupLocation: "Baker",
        requester: id2,
        shopper: id3,
        actualPrice: 8,
        pickupTime: new Date('2016-11-23T23:00:00')}], function(err, doc) {
          Delivery.getRequests(id1, new Date('2016-11-23T15:00:00'), ["HMart", "Trader Joe's", "Whole Foods"], ["Lobby 7", "Baker"], null, function(err, requestItems) {
            assert.strictEqual(requestItems.length, 0);
            done();
          });
        });
    });

    it("should not populate requests whose deadlines have passed", function(done) {
      Delivery.create({stores: ["Whole Foods"],
        status: "pending",
        deadline: new Date('2016-11-23T18:59:59'),
        itemName: "test-item-icecream",
        itemDescription: "test-description-tasty",
        itemQuantity: "test-quantity-1",
        estimatedPrice: 5,
        tips: 0.5,
        pickupLocation: "Burton Conner",
        requester: id3}, function(err, doc) {
          Delivery.getRequests(id2, new Date('2016-11-23T20:00:00'), null, ["Lobby 7", "Burton Conner"], null, function(err, requestItems) {
            assert.strictEqual(requestItems.length, 0);
            done();
          });
        });
    });

    it("should not populate requests from stores outside of the filter list of stores", function(done) {
      Delivery.create({stores: ["Whole Foods", "HMart"],
        status: "pending",
        deadline: new Date('2016-11-23T18:59:59'),
        itemName: "test-item-icecream",
        itemDescription: "test-description-tasty",
        itemQuantity: "test-quantity-1",
        estimatedPrice: 5,
        tips: 0.5,
        pickupLocation: "Burton Conner",
        requester: id3}, function(err, doc) {
          Delivery.getRequests(id2, new Date('2016-11-23T12:00:00'), ["Trader Joe's", "Star Market"], ["Lobby 7", "Burton Conner"], null, function(err, requestItems) {
            assert.strictEqual(requestItems.length, 0);
            done();
          });
        });
    });

    it("should not populate requests with pickup locations outside of the filter list of locations", function(done) {
      Delivery.create({stores: ["Whole Foods", "HMart"],
        status: "pending",
        deadline: new Date('2016-11-23T18:59:59'),
        itemName: "test-item-icecream",
        itemDescription: "test-description-tasty",
        itemQuantity: "test-quantity-1",
        estimatedPrice: 5,
        tips: 0.5,
        pickupLocation: "Senior",
        requester: id2}, function(err, doc) {
          Delivery.getRequests(id1, new Date('2016-11-23T12:00:00'), ["Trader Joe's", "HMart"], ["Lobby 7", "Burton Conner"], null, function(err, requestItems) {
            assert.strictEqual(requestItems.length, 0);
            done();
          });
        });
    });

    it("should sort pending requests in the correct order", function(done) {
      Delivery.create([{stores: ["Whole Foods"],
        status: "pending",
        deadline: new Date('2016-11-23T18:59:59'),
        itemName: "test-item-blueberries",
        itemDescription: "test-description-yuge",
        itemQuantity: "test-quantity-3",
        estimatedPrice: 12,
        tips: 0.5,
        pickupLocation: "Lobby 7",
        requester: id3},
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
          Delivery.getRequests(id1, new Date('2016-11-23T15:00:00'), null, null, ["tips", -1], function(err, requestItems) {
            assert.strictEqual(requestItems.length, 3);
            assert.strictEqual(requestItems[0].itemName, "test-item-pie");
            assert.strictEqual(requestItems[1].itemName, "test-item-blueberries");
            assert.strictEqual(requestItems[2].itemName, "test-item-yoghurt");
            Delivery.getRequests(id1, new Date('2016-11-23T15:00:00'), null, null, ["tips", 1], function(err, requestItems) {
              assert.strictEqual(requestItems.length, 3);
              assert.strictEqual(requestItems[0].itemName, "test-item-yoghurt");
              assert.strictEqual(requestItems[1].itemName, "test-item-blueberries");
              assert.strictEqual(requestItems[2].itemName, "test-item-pie");
              done();
            });
          });
        });
    });
  }); //End describe Delivery
}); // End describe App.