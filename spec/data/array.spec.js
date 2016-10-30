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
    describe("cartesian", () => {
        it("should create the cartesian product", () => {
            expect(array.cartesian([1, 2, 3], ["a", "b"]))
                .to.eql([[1, "a"], [1, "b"], [2, "a"], [2, "b"], [3, "a"], [3, "b"]]);
        });
    });
});
