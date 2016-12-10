// Author: Czarina Lao
(function() {
    mocha.setup("bdd");
    var assert = chai.assert;
    describe("Time Format", function() {
        describe("JS Time", function() {
            it("should return the positive 2-digit number back as a string", function() {
                assert.equal(54, numberToJsTimeFormat(54));
            });

            it("should return the negative 2-digit number back as the positive 2-digit string", function() {
                assert.equal('54', numberToJsTimeFormat(-54));
            });

            it("should return the 1-digit number back as a 2-digit string", function() {
                assert.equal('04', numberToJsTimeFormat(4));
            });

            it("should return the negative 1-digit number back as a positive 2-digit string", function() {
                assert.equal('04', numberToJsTimeFormat(-4));
            });

            it("should return the number < 10 with decimal places back as a rounded 2-digit string", function() {
                assert.equal('03', numberToJsTimeFormat(3.54));
            });

            it("should return the number > -10 with decimal places back as a positive rounded 2-digit string", function() {
                assert.equal('04', numberToJsTimeFormat(-3.54));
            });

            it("should return the number >= 10 with decimal places back as a rounded 2-digit string", function() {
                assert.equal('13', numberToJsTimeFormat(13.54));
            });

            it("should return the negative number <= -10 with decimal places back as a positive rounded 2-digit string", function() {
                assert.equal('14', numberToJsTimeFormat(-13.54));
            });

        });
        
        describe("Phone and Credit Card Numbers", function() {
            it("should return the same string", function() {
                assert.equal('1234567890', formatNumberString('1234567890'));
            });

            it("should return the string without the space", function() {
                assert.equal('1234567890', formatNumberString('12345 67890'));
            });

            it("should return the string without the multiple spaces", function() {
                assert.equal('1234567890', formatNumberString('123 456 7890'));
            });

            it("should return the string without the dash", function() {
                assert.equal('1234567890', formatNumberString('123-4567890'));
            });

            it("should return the string without the dashes", function() {
                assert.equal('1234567890', formatNumberString('123-456-7890'));
            });

            it("should return the string without the parenthesis", function() {
                assert.equal('1234567890', formatNumberString('(1234567890'));
            });

            it("should return the string without the parentheses", function() {
                assert.equal('1234567890', formatNumberString('(123)4567890'));
            });

            it("should return the string without the parentheses and dashes", function() {
                assert.equal('1234567890', formatNumberString('(123)-456-7890'));
            });

            it("should return the string without the parentheses, dashes and spaces", function() {
                assert.equal('1234567890', formatNumberString('(123)  -  ((456))  --  7890  ()'));
            });
        });
    });

    mocha.run();
})();

