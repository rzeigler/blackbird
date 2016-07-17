const {expect} = require("chai");
const {parallel} = require("../loader");
const string = parallel(require, __filename);

describe("data/string", function () {
    describe("#indexOf", function () {
        it("should return the index of a substring", function () {
            expect(string.indexOf("b", "abc")).to.equal("abc".indexOf("b"));
        });
    });
    describe("#split", function () {
        it("should split at a token", function () {
            expect(string.split(":", "a:b:c")).to.eql(["a", "b", "c"]);
        });
    });
    describe("#trim", function () {
        it("should trim", function () {
            expect(string.trim("   a ")).to.equal("a");
        });
    });
    describe("#length", function () {
        it("should get length", function () {
            expect(string.length("abc")).to.equal(3);
        });
    });
    describe("#toLowerCase", function () {
        it("should lowercase a string", function () {
            expect(string.toLowerCase("ABC")).to.equal("abc");
        });
    });
});
