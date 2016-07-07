const assert = require("assert");

const array = require("../array");

describe("array", function () {
    describe("length", function () {
        it("should return the length of an array", function () {
            assert.equal(array.length([1, 2, 3]), 3);
        });
    });
    describe("join", function () {
        it("should join", function () {
            assert.equal(array.join(" ", [1, 2, 3]), "1 2 3");
        });
    });
});
