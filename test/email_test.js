// Author: Cheahuychou Mao

var assert = require('chai').assert;
var mongoose = require("mongoose");
var User = require("../models/user");
var utils = require('../javascripts/utils.js');
var email = require('../javascripts/email.js');

describe("Email", function() {
  describe("createVerificationToken", function() {
        // The mongoose connection object.
        var con;
        // Before running any test, connect to the database.
        before(function(done) {
            con = mongoose.connect("mongodb://localhost/grocery-email-test", function() {
                done();
            });
        });

        // Delete the database before each test.
        beforeEach(function(done) {
            con.connection.db.dropDatabase(function() { done(); });
        });

        it("should have the correct number of digits", function(done) {
            var userJSON = {"username": "testuser", "password": "123456", "mitId": 123456789, "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail"}
            User.create(userJSON, function(err, user) {
                assert.isNull(err);
                email.createVerificationToken(user, function (err, token) {
                    assert.equal(user.verificationToken.toString().length, utils.numTokenDigits());
                    done()
                });
            });
        });

        it("should get saved in the user's field and the token should be random", function(done) {
            var userJSON = {"username": "testuser", "password": "123456", "mitId": 123456789, "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail"}
            User.create(userJSON, function(err, user) {
                assert.isNull(err);
                email.createVerificationToken(user, function (err, token) {
                    assert.isNotNull(user.verificationToken);
                    var currentToken = user.verificationToken;
                    email.createVerificationToken(user, function (err, token) {
                        assert.isNotNull(user.verificationToken);
                        var newToken = user.verificationToken;
                        assert(currentToken !== newToken);
                        done();
                    });
                });
            });
        });
  });
});