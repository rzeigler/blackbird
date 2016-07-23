const jsverify = require("jsverify");
const R = require("ramda");
const {expect} = require("chai");
const {parallel} = require("../loader");
const Option = require("fantasy-options");
const path = parallel(require, __filename);
const {lit, any, nat, match, Result} = path;

describe("router", () => {
    describe("path", () => {
        describe("lit", () => {
            it("should match the expected input", () => {
                expect(lit("bc").impl("bc")).to.eql(new Option.Some({}));
            });
            it("should not match different input", () => {
                expect(lit("bc").impl("c")).to.eql(Option.None);
            });
        });
        describe("any", () => {
            it("should match any input", () => jsverify.assert(jsverify.forall(jsverify.nestring, (s) =>
                R.equals(any("b").impl(s), new Option.Some({b: s}))
            )));
        });
        describe("nat", () => {
            it("should match any natural number", () => jsverify.assert(jsverify.forall(jsverify.nat, (n) =>
                R.equals(nat("b").impl(n.toString()), new Option.Some({b: n})))));
            it("should not match other strings", () => {
                expect(nat("b").impl("b")).to.equal(Option.None);
            });
        });
        describe("match", () => {
            const elems = [lit("a"), any("b"), lit("c"), nat("d")];
            it("should return a Some on matching", () => {
                const p = ["a", "qrs", "c", "10"];
                expect(match(elems, p)).to.eql(new Option.Some(Result({b: "qrs", d: 10}, [])));
            });
            it("should return a Some on matching with remainder", () => {
                const p = ["a", "qrs", "c", "10", "b", "d"];
                expect(match(elems, p)).to.eql(new Option.Some(Result({b: "qrs", d: 10}, ["b", "d"])));
            });
            it("should return a None on too short", () => {
                const p = ["a", "qrs", "c"];
                expect(match(elems, p)).to.eql(Option.None);
            });
            it("should return a None on failling", () => {
                const p = ["a", "qrs", "c", "q"];
                expect(match(elems, p)).to.eql(Option.None);
            });
        });
    });
});
