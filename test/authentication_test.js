var assert = require('chai').assert;
var authentication = require('../javascripts/authentication.js');
var mongoose = require("mongoose");
var User = require("../models/user");
var Delivery = require("../models/delivery");

describe("Authentication", function() {
	describe("createUserJSON", function(done) {
		it("should return JSON object containing all the necessary fields", function(done) {
            authentication.createUserJSON('testUser', 'testPassword', 1234567890, 'Maseeh', {person: {givenName: 'Jane', familyName: 'Doe'}}, function (err, userJSON) {
        		assert.isNull(err);
        		assert.strictEqual(userJSON.username, 'testUser');
        		assert.isNotNull(userJSON.password);
        		assert.strictEqual(userJSON.phoneNumber, 1234567890);
        		assert.strictEqual(userJSON.dorm, 'Maseeh');
        		assert.strictEqual(userJSON.firstName, 'Jane');
        		assert.strictEqual(userJSON.lastName, 'Doe');
                done();
            }); 
        });

        it("should return assign test first and last name when MIT data is empty", function(done) {
            authentication.createUserJSON('testUser', 'testPassword', 1234567890, 'Maseeh', {}, function (err, userJSON) {
        		assert.isNull(err);
        		assert.isNotNull(userJSON.password);
        		assert.strictEqual(userJSON.phoneNumber, 1234567890);
        		assert.strictEqual(userJSON.dorm, 'Maseeh');
        		assert.strictEqual(userJSON.firstName, 'FirstNameTest');
        		assert.strictEqual(userJSON.lastName, 'LastNameTest');
                done();
            }); 
        });

        it("should contain hashed password", function(done) {
            authentication.createUserJSON('testUser', 'testPassword', 1234567890, 'Maseeh', {}, function (err, userJSON) {
        		assert.isNull(err);
        		assert.isNotNull(userJSON.password);
        		assert(userJSON.password !== 1234567890);
                done();
            } ); 
        });
	});

});