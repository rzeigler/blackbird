const R = require("ramda");
const {expect} = require("chai");
const Either = require("fantasy-eithers");
const Option = require("fantasy-options");
const {parallel} = require("../loader");
const either = parallel(require, __filename);

describe("data/either", function () {
    describe("#inhabitOneOf", function () {
        it("should inhabit to right when argument 2 is defined", function () {
            expect(either.inhabitOneOf(1, 2)).to.eql(new Either.Right(2));
        });
        it("should inhabit the left when argument 2 is undefined", function () {
            expect(either.inhabitOneOf(1, null)).to.eql(new Either.Left(1));
        });
    });
    describe("#attempt", function () {
        function evenThrower(v) {
            if (v % 2 === 0) {
                throw new TypeError("only accepts odds");
            }
            return v;
        }
        it("should return a right on success", function () {
            expect(either.attempt(evenThrower, 1).fold(R.F, R.T)).to.equal(true);
        });
        it("should return a left on failure", function () {
            expect(either.attempt(evenThrower, 2).fold(R.T, R.F)).to.equal(true);
        });
    });
    describe("#leftMap", function () {
        it("should map on lefts", function () {
            expect(either.leftMap(R.add(1), either.left(1))).to.eql(either.left(2));
        });
        it("should do nothing on rights", function () {
            expect(either.leftMap(R.add(1), either.right(1))).to.eql(either.right(1));
        });
    });
    describe("#toOption", () => {
        it("should convert lefts to None", () => {
            expect(either.toOption(Either.Left(1))).to.eql(Option.None);
        });
        it("should conver rights to Some", () => {
            expect(either.toOption(Either.Right(1))).to.eql(Option.Some(1));
        });
    });
});
