var assert = require("assert");
var mongoose = require("mongoose");
var User = require('../models/user');
var Delivery = require('../models/delivery');

describe("App", function() {
  // The mongoose connection object.
  var con;

  // Before running any test, connect to the database.
  before(function(done) {
    con = mongoose.connect("mongodb://localhost/grocerydb", function() {
      done();
    });
  });

  // Delete the database before each test.
  beforeEach(function(done) {
    con.connection.db.dropDatabase(function() { done(); });
  });

  describe("Delivery", function() {

    var testUser1 = new User({
      "username": "test1",
      "password": "something",
      "mit_id": 1,
      "phone_number": 1,
      "dorm": "Baker"
    });
    var id1 = testUser1._id;

    var testUser2 = new User({
      "username": "test1",
      "password": "something2",
      "mit_id": 2,
      "phone_number": 2,
      "dorm": "Random"
    });
    var id2 = testUser2._id;

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
  }); //End describe Delivery
}); // End describe App.