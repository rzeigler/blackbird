const {expect} = require("chai");
const {parallel} = require("../loader");
const number = parallel(require, __filename);

describe("data/number", function () {
    describe("#parseInt", function () {
        it("should be correctly flipped and curried", function () {
            expect(number.parseInt(10)("42")).to.equal(42);
        });
    });
});
