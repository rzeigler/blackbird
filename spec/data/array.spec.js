const {expect} = require("chai");
const {parallel} = require("../loader");
const array = parallel(require, __filename);

describe("data/array", function () {
    describe("length", function () {
        it("should return the length of an array", function () {
            expect(array.length([1, 2, 3])).to.equal(3);
        });
    });
    describe("join", function () {
        it("should join", function () {
            expect(array.join(" ", [1, 2, 3])).to.equal("1 2 3");
        });
    });
});
