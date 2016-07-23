const jsverify = require("jsverify");
const R = require("ramda");
const {expect} = require("chai");
const {parallel, lib} = require("../loader");
const Option = require("fantasy-options");
const path = parallel(require, __filename);
const {string} = lib(require, "data");
const {lit, any, nat, match, express, parseExpressString, expressPathCombinator, Result} = path;

describe("router", () => {
    describe("path", () => {
        describe("lit", () => {
            it("should match the expected input", () => {
                expect(lit("bc").impl("bc")).to.eql(Option.Some({}));
            });
            it("should not match different input", () => {
                expect(lit("bc").impl("c")).to.eql(Option.None);
            });
        });
        describe("any", () => {
            it("should match any input", () => jsverify.assert(jsverify.forall(jsverify.nestring, (s) =>
                R.equals(any("b").impl(s), Option.Some({b: s}))
            )));
        });
        describe("nat", () => {
            it("should match any natural number", () => jsverify.assert(jsverify.forall(jsverify.nat, (n) =>
                R.equals(nat("b").impl(n.toString()), Option.Some({b: n})))));
            it("should not match other strings", () => {
                expect(nat("b").impl("b")).to.equal(Option.None);
            });
        });

        describe("expressPathCombinator", () => {
            it("should convert literals", () => {
                const r = expressPathCombinator("a");
                expect(r.type).to.equal("lit");
            });
            it("should convert anys", () => {
                const r = expressPathCombinator(":foo");
                expect (r.type).to.equal("any");
            });
        });

        describe("parseExpressString", () => {
            it("should parse an express string", () => {
                const r = parseExpressString("/a/:foo/d");
                expect(r.length).to.equal(3);
                expect(r[0].type).to.equal("lit");
                expect(r[1].type).to.equal("any");
            });
        });

        describe("express", () => {
            const elems = express(["/a/b/c/:foo/d"]);
            it("should return a some on matching", () => {
                expect(match(elems, ["a", "b", "c", "bar", "d"])).to.eql(Option.Some(Result({foo: "bar"}, [])));
            });
            it("should reeturn a none on miss", () => {
                expect(match(elems, ["a", "b", "d", "bar", "d"])).to.eql(Option.None);
            });
            it("should be mixable with full combinators", () => {
                const elems = express(["/a/b/c/:foo/", nat("d")]);
                expect(match(elems, string.split("/", "a/b/c/bar/10")))
                    .to.eql(Option.Some(Result({foo: "bar", d: 10}, [])));
            });
        });
        describe("match", () => {
            const elems = [lit("a"), any("b"), lit("c"), nat("d")];
            it("should return a Some on matching", () => {
                const p = ["a", "qrs", "c", "10"];
                expect(match(elems, p)).to.eql(Option.Some(Result({b: "qrs", d: 10}, [])));
            });
            it("should return a Some on matching with remainder", () => {
                const p = ["a", "qrs", "c", "10", "b", "d"];
                expect(match(elems, p)).to.eql(Option.Some(Result({b: "qrs", d: 10}, ["b", "d"])));
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
