const {expect} = require("chai");
const Option = require("fantasy-options");
const {view} = require("ramda");
const {parallel} = require("../loader");
const value = parallel(require, __filename);

describe("media/value", function () {
    describe("#value", function () {
        it("should construct values of media", function () {
            expect(value("application", "json", {}))
                .to.deep.equal({type: "application", subtype: "json", parameters: {}});
        });
    });
    describe("#typeLens", function () {
        it("should focus on the type", function () {
            expect(view(value.typeLens, value("application", "json", {})))
                .to.equal("application");
        });
    });
    describe("#subtypeLens", function () {
        it("should focus on the subtype", function () {
            expect(view(value.subtypeLens, value("application", "json", {})))
                .to.equal("json");
        });
    });
    describe("#parameterLens", function () {
        it("should return a some of a specific parameter when present", function () {
            expect(view(value.parameterLens("q"), value("application", "json", {q: "1"})))
                .to.deep.equal(new Option.Some("1"));
        });
        it("should return a none if the parameter is not present", function () {
            expect(view(value.parameterLens("q"), value("application", "json", {})))
                .to.deep.equal(Option.None);
        });
    });
});
