// Author: Cheahuychou Mao

var assert = require('chai').assert;
var mongoose = require("mongoose");
var User = require("../models/user");
var authentication = require('../javascripts/authentication.js');

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
    var verificationToken = '00000000000000000000000000000000';
    var firstName = 'testFirstName';
    var lastName = 'testLastName';

    describe("Create", function() {
      it("should create a user successfully when all fields are present and valid", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey","firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNull(err);
          User.findOne({"username": "testuser"}, function(err, user) {
            assert.isNull(err);
            assert.isNotNull(user);
            done();
          });
        });
      });

      it("should fail to create a user when the username is missing", function(done) {
        var userJSON = {"password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should fail to create a user when the password is missing", function(done) {
        var userJSON = {"username": "testuser", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should fail to create a user when the phone number is missing", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should fail to create a user when the dorm is missing", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should fail to create a user when stripeId is missing", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should fail to create a user when stripeEmail is missing", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should fail to create a user when stripePublishableKey is missing", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should fail to create a user when first name is missing", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should fail to create a user when the dorm is missing", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should not allow empty usernames", function(done) {
        var userJSON = {"username": "   ", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should not allow empty passwords", function(done) {
        var userJSON = {"username": "testuser", "password": "   ", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should not allow empty first names", function(done) {
        var userJSON = {"username": "testuser", "password": "1234567890", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": "   ", "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should not allow empty last names", function(done) {
        var userJSON = {"username": "testuser", "password": "123456789", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": "      "};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should not allow invalid phone number", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 12345678, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should not allow invalid dorm", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 12345678, "dorm": "WILG", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNotNull(err);
          done();
        });
      });

      it("should have verified set to false when first got created", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNull(err);
          User.findOne({"username": "testuser"}, function(err, user) {
            assert(!user.verified);
            done();
          });
        });
      });

    });

    describe("setVerificationToken", function() {
      it("should set a verification token successfully", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNull(err);
          User.findOne({"username": "testuser"}, function(err, user) {
            user.setVerificationToken(verificationToken, function (err, user) {
                assert.isNull(err);
                assert.isNotNull(user.verificationToken);
                done();
            });
          });
        });
      });
    });

    describe("verify", function() {
      it("should set verified to true", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNull(err);
          User.findOne({"username": "testuser"}, function(err, user) {
            user.setVerificationToken(verificationToken, function (err, user) {
                assert.isNull(err);
                assert.isNotNull(user);
                user.verify(function (err, user) {
                    assert(user.verified);
                    done();
                });
            });
          });
        });
      });

      it("should not throw an error or unverified if is already verified", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNull(err);
          User.findOne({"username": "testuser"}, function(err, user) {
            user.setVerificationToken(verificationToken, function (err, user) {
                assert.isNull(err);
                assert.isNotNull(user);
                user.verify(function (err, user) {
                    assert(user.verified);
                    user.verify(function (err, user) {
                      assert.isNull(err);
                      assert(user.verified);
                      done();
                    });
                });
            });
          });
        });
      });
    });

    describe("verifyAccount", function() {
      it("should verify an account successfully when the token is correct", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNull(err);
          User.findOne({"username": "testuser"}, function(err, user) {
            user.setVerificationToken(verificationToken, function (err, user) {
                assert.isNull(err);
                assert.isNotNull(user);
                assert(!user.verified);
                User.verifyAccount(user.username, verificationToken, function (err, user) {
                    assert.isNull(err);
                    assert(user.verified);
                    done();
                });
            });
          });
        });
      });

      it("should return an error when the token is incorrect", function(done) {
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          assert.isNull(err);
          User.findOne({"username": "testuser"}, function(err, user) {
            user.setVerificationToken(verificationToken, function (err, user) {
                assert.isNull(err);
                assert.isNotNull(user);
                assert(!user.verified);
                User.verifyAccount(user.username, '0', function (err, user) {
                    assert.isNotNull(err);
                    done();
                });
            });
          });
        });
      });
    });

    describe("signUp", function() {
      it("should create an account successfully", function(done) {
        authentication.createUserJSON('testUser', 'Iwantpizza3@', 1234567890, 'Maseeh', {person: {givenName: 'Jane', familyName: 'Doe'}}, function (err, userJSON) {
          assert.isNull(err);
          userJSON.stripeId = 'testStripeId';
          userJSON.stripePublishableKey = 'testUserStripePublishableKey';
          userJSON.stripeEmail = 'testStripeEmail';
          User.signUp(userJSON, true, function (err, user) {
            User.findOne({username: user.username}, function (err, user) {
              assert.isNull(err);
              assert.isNotNull(user);
              done();
            })
          })
        }); 
      });

      it("should set a verification token", function(done) {
        authentication.createUserJSON('testUser', 'Iwantpizza3@', 1234567890, 'Maseeh', {person: {givenName: 'Jane', familyName: 'Doe'}}, function (err, userJSON) {
          assert.isNull(err);
          userJSON.stripeId = 'testStripeId';
          userJSON.stripePublishableKey = 'testUserStripePublishableKey';
          userJSON.stripeEmail = 'testStripeEmail';
          User.signUp(userJSON, true, function (err, user) {
            User.findOne({username: user.username}, function (err, user) {
              assert.isNull(err);
              assert.isNotNull(user);
              assert.isNotNull(user.verificationToken);
              done();
            })
          })
        }); 
      });    
    });

    describe("authenticate", function() {
      it("should authenticate successfully when the username and password are valid and correct", function(done) {
        authentication.createUserJSON('testUser', 'Iwantpizza3@', 1234567890, 'Maseeh', {person: {givenName: 'Jane', familyName: 'Doe'}}, function (err, userJSON) {
          assert.isNull(err);
          userJSON.stripeId = 'testStripeId';
          userJSON.stripePublishableKey = 'testUserStripePublishableKey';
          userJSON.stripeEmail = 'testStripeEmail';
          User.signUp(userJSON, true, function (err, user) {
            User.findOne({username: user.username}, function (err, user) {
              assert.isNull(err);
              assert.isNotNull(user);
              User.authenticate('testUser', 'Iwantpizza3@', function (err, user) {
                assert.isNull(err);
                done();
              });
            })
          })
        }); 
      });

      it("should fail when the username is invalid", function(done) {
        authentication.createUserJSON('testUser', 'Iwantpizza3@', 1234567890, 'Maseeh', {person: {givenName: 'Jane', familyName: 'Doe'}}, function (err, userJSON) {
          assert.isNull(err);
          userJSON.stripeId = 'testStripeId';
          userJSON.stripePublishableKey = 'testUserStripePublishableKey';
          userJSON.stripeEmail = 'testStripeEmail';
          User.signUp(userJSON, true, function (err, user) {
            User.findOne({username: user.username}, function (err, user) {
              assert.isNull(err);
              assert.isNotNull(user);
              User.authenticate('testUser1', 'Iwantpizza3@', function (err, user) {
                assert.isNotNull(err);
                done();
              });
            });
          });
        }); 
      });

      it("should fail when the password is wrong", function(done) {
        authentication.createUserJSON('testUser', 'Iwantpizza3@', 1234567890, 'Maseeh', {person: {givenName: 'Jane', familyName: 'Doe'}}, function (err, userJSON) {
          assert.isNull(err);
          userJSON.stripeId = 'testStripeId';
          userJSON.stripePublishableKey = 'testUserStripePublishableKey';
          userJSON.stripeEmail = 'testStripeEmail';
          User.signUp(userJSON, true, function (err, user) {
            User.findOne({username: user.username}, function (err, user) {
              assert.isNull(err);
              assert.isNotNull(user);
              User.authenticate('testUser', 'Iwantpizza3@1', function (err, user) {
                assert.isNotNull(err);
                done();
              });
            });
          });
        }); 
      });        
    });

    describe("editFields", function(){
      it("should be able to change a password", function(done){
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          User.changePassword(user.username, "Iwantpizza2@", function(err){
            assert.isNull(err);
            User.authenticate("testuser", "Iwantpizza2@", function(err, user){
              assert.isNull(err);
              done();
            });
          });
        });
      });
      it("should be able to change phone number and dorm", function(done){
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          User.editProfile(user.username, 1234567899, "Next House", function(err){
            assert.isNull(err);
            User.findOne({"username" : "testuser"}, function(err, user){
              assert.strictEqual(user.phoneNumber, 1234567899);
              assert.strictEqual(user.dorm, "Next House");
              done();
            });
          });
        });
      });
      it("should not be able to change to an invalid phone number", function(done){
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          User.findOne({"username" : "testuser"}, function(err, user){
            user.changePhoneNumber(123456789, function(err){
              assert.isNotNull(err);
              done();
            });
          });
        });
      });
      it("should not be able to change to an invalid dorm", function(done){
        var userJSON = {"username": "testuser", "password": "Iwantpizza3@", "phoneNumber": 1234567890, "dorm": "Maseeh", "stripeId":"testuserStripeId", "stripeEmail": "testuserStripeEmail", "stripePublishableKey": "testuserStripePublishableKey", "firstName": firstName, "lastName": lastName};
        User.create(userJSON, function(err, user) {
          User.findOne({"username" : "testuser"}, function(err, user){
            user.changeDorm("House", function(err){
              assert.isNotNull(err);
              done();
            });
          });
        });
      });
    });
  });
});