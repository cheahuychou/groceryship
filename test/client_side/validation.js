// Author: Czarina Lao
(function() {
    mocha.setup("bdd");
    var assert = chai.assert;
    describe("Validation", function() {
        describe("Price", function() {
            it("should return false for prices without numbers", function() {
                assert.isFalse(checkPriceFormat('price'));
            });

            it("should return false for prices without numbers at the start", function() {
                assert.isFalse(checkPriceFormat('price123'));
            });

            it("should return false for negative prices", function() {
                assert.isFalse(checkPriceFormat('-2'));
            });

            it("should return false for prices equal to 0 when isZeroOk is false", function() {
                assert.isFalse(checkPriceFormat('0', false));
            });

            it("should return 0 for prices equal to 0 when isZeroOk is true", function() {
                assert.equal('0.00', checkPriceFormat('0', true));
            });

            it("should return 0 for prices equal to 0 when isZeroOk is true", function() {
                assert.equal('0.00', checkPriceFormat('0', true));
            });

            it("should return the whole number price with 2 decimal places", function() {
                assert.equal('15.00', checkPriceFormat('15', true));
            });

            it("should return the price input with 1 decimal place in 2 decimal places", function() {
                assert.equal('61.70', checkPriceFormat('61.7', true));
            });

            it("should return the same price with 2 decimal places", function() {
                assert.equal('61.70', checkPriceFormat('61.70', true));
            });

            it("should return the same price rounded to 2 decimal places", function() {
                assert.equal('61.70', checkPriceFormat('61.697', true));
            });
        });
    });

    // mocha.run();
})();

