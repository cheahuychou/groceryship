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

        describe("Scripting Tags", function() {
            it("should return false for text without scripting tags", function() {
                assert.isFalse(findScriptingTags('hello'));
            });

            it("should return false for text with less than signs but not scripting tags", function() {
                assert.isFalse(findScriptingTags('<3'));
            });


            it("should return false for text with greater than signs but not scripting tags", function() {
                assert.isFalse(findScriptingTags(':>'));
            });

            it("should return false for text with less than and greater than signs but not scripting tags", function() {
                assert.isFalse(findScriptingTags('< hello world >'));
            });

            it("should return true for text with 1 part of a scripting tag", function() {
                assert.isTrue(findScriptingTags('<script>hello'));
            });

            it("should return true for text with 1 pair of a scripting tags", function() {
                assert.isTrue(findScriptingTags('<script>hello</script>'));
            });

            it("should return true for text with multiple nested scripting tags", function() {
                assert.isTrue(findScriptingTags('<script><b>hello<b></script>'));
            });

            it("should return true for text with multiple scripting tags in lower case", function() {
                assert.isTrue(findScriptingTags('<script>hello</script> <script>hi</script>'));
            });

            it("should return true for text with scripting tags in mixed case", function() {
                assert.isTrue(findScriptingTags('<scRIPt>hello</scRIPt>'));
            });

            it("should return true for text with scripting tags in upper case", function() {
                assert.isTrue(findScriptingTags('<B>hello</B>'));
            });
        });

        describe("Phone Number", function() {
            it("should return false for empty phone numbers", function() {
                assert.isFalse(isValidPhoneNumber(''));
            });

            it("should return false for phone numbers that is only whitespace", function() {
                assert.isFalse(isValidPhoneNumber('   '));
            });

            it("should return false for phone numbers with characters that are not numbers only", function() {
                assert.isFalse(isValidPhoneNumber('abc123!@#'));
            });

            it("should return false for phone numbers with characters that are not numbers and exactly 10 digits", function() {
                assert.isFalse(isValidPhoneNumber('6172531000a'));
            });

            it("should return false for phone numbers with less than 10 digits", function() {
                assert.isFalse(isValidPhoneNumber('617253100'));
            });

            it("should return false for phone numbers with more than 10 digits", function() {
                assert.isFalse(isValidPhoneNumber('61725310000'));
            });

            it("should return true for phone numbers with exactly 10 digits", function() {
                assert.isTrue(isValidPhoneNumber('6172531000'));
            });
        });

        describe("Kerberos", function() {
            it("should return false for an empty kerberos", function() {
                assert.isFalse(isValidKerberos(''));
            });

            it("should return false for a kerberos that is only whitespace", function() {
                assert.isFalse(isValidKerberos('     '));
            });

            it("should return false for a kerberos with scripting tags", function() {
                assert.isFalse(isValidKerberos('<script>kerberos</script>'));
            });

            it("should return true for a valid kerberos", function() {
                assert.isTrue(isValidKerberos('kerberos'));
            });
        });

        describe("Password", function() {
            it("should return false for an empty password", function() {
                assert.isFalse(isValidPassword(''));
            });

            it("should return false for a password that is only whitespace", function() {
                assert.isFalse(isValidPassword('      '));
            });

            it("should return false for a password with scripting tags", function() {
                assert.isFalse(isValidPassword('<script>password</script>'));
            });

            it("should return true for a valid password (not counting strength)", function() {
                assert.isTrue(isValidPassword('password123'));
            });
        });

        describe("Password Strength", function() {
            it("should return false for text less than 8 characters", function() {
                assert.isFalse(testPasswordStrength('aB1@'));
            });

            it("should return false for text without a number", function() {
                assert.isFalse(testPasswordStrength('abcDEF!@#'));
            });

            it("should return false for text without an uppercase letter", function() {
                assert.isFalse(testPasswordStrength('abc123!@#'));
            });

            it("should return false for text without a lowercase letter", function() {
                assert.isFalse(testPasswordStrength('ABC123!@#'));
            });

            it("should return false for text without a special character", function() {
                assert.isFalse(testPasswordStrength('ABC123defg'));
            });

            it("should return true for a strong enough password similar characters adjacent", function() {
                assert.isTrue(testPasswordStrength('ABC123defg!@#$'));
            });

            it("should return true for a strong enough password similar characters mixed", function() {
                assert.isTrue(testPasswordStrength('Ab1%2De^fG3'));
            });

            it("should return true for a strong enough password with exactly 8 characters", function() {
                assert.isTrue(testPasswordStrength('AB12de*&'));
            });
        });
    });

})();
