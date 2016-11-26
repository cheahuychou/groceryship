var assert = require('chai').assert;
var mongoose = require("mongoose");
var User = require("../models/user");

describe("Models", function() {
  // The mongoose connection object.
  var con;
  // Before running any test, connect to the database.
  before(function(done) {
    con = mongoose.connect("mongodb://localhost/grocery-user-test", function() {
      done();
    });
  });

  // Delete the database before each test.
  beforeEach(function(done) {
    con.connection.db.dropDatabase(function() { done(); });
  });

  describe("User", function() {

    describe("Create", function() {
      it("should create a user successfully when all fields are present and valid", function(done) {
        var userJSON = {"username": "testuser", "password": "123456", "mitId": 123456789, "phoneNumber": 1234567890, "dorm": "Maseeh"}
        User.create(userJSON, function(err, user) {
          assert.isNull(err);
          User.findOne({"username": "testuser1"}, function(err, user) {
            done();
          });
        });
      });

      it("should fail to create a user when the username is missing", function(done) {
        var userJSON = {"password": "123456", "mitId": 123456789, "phoneNumber": 1234567890, "dorm": "Maseeh"};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should fail to create a user when the password is missing", function(done) {
        var userJSON = {"username": "testuser", "mitId": 123456789, "phoneNumber": 1234567890, "dorm": "Maseeh"};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should fail to create a user when the MIT ID is missing", function(done) {
        var userJSON = {"username": "testuser", "password": "123456", "phoneNumber": 1234567890, "dorm": "Maseeh"};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should fail to create a user when the phone number is missing", function(done) {
        var userJSON = {"username": "testuser", "password": "123456", "mitId": 123456789, "dorm": "Maseeh"};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should fail to create a user when the dorm is missing", function(done) {
        var userJSON = {"username": "testuser", "password": "123456", "mitId": 123456789, "phoneNumber": 1234567890};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should not allow empty usernames", function(done) {
        var userJSON = {"username": "   ", "password": "123456", "mitId": 123456789, "phoneNumber": 1234567890, "dorm": "Maseeh"}
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should not allow empty passwords", function(done) {
        var userJSON = {"username": "testuser", "password": "   ", "mitId": 123456789, "phoneNumber": 1234567890, "dorm": "Maseeh"}
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should not allow invalid MIT ID", function(done) {
        var userJSON = {"username": "testuser", "password": "123456", "mitId": 12345678, "phoneNumber": 1234567890, "dorm": "Maseeh"}
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should not allow invalid phone number", function(done) {
        var userJSON = {"username": "testuser", "password": "123456", "mitId": 123456789, "phoneNumber": 12345678, "dorm": "Maseeh"}
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should not allow invalid dorm", function(done) {
        var userJSON = {"username": "testuser", "password": "123456", "mitId": 123456789, "phoneNumber": 12345678, "dorm": "WILG"}
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

    });
  });
});