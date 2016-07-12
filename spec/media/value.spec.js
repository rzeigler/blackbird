const {expect} = require("chai");
const R = require("ramda");
const jsverify = require("jsverify");
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
    describe("#generalizationOf", function () {
        it("property - generalization of wildcard to all media types", function () {
            jsverify.assert(jsverify.forall(jsverify.string, jsverify.string, function (t, st) {
                return value.generalizationOf(value("*", "*", {}), value(t, st, {}));
            }));
        });
        it("property - wildcard cannot be a generalization of anything", function () {
            jsverify.assert(jsverify.forall(jsverify.string, jsverify.string, function (t, st) {
                return !value.generalizationOf(value(t, st, {}), value("*", "*", {}));
            }));
        });
        it("property - generalization of subtype wildcard to related media types", function () {
            jsverify.assert(jsverify.forall(jsverify.string, function (st) {
                return value.generalizationOf(value("application", "*", {}), value("application", st, {}));
            }));
        });
        it("property - subtype wildcard cannot be a generalization of related", function () {
            jsverify.assert(jsverify.forall(jsverify.string, function (st) {
                return !value.generalizationOf(value("application", st, {}), value("application", "*", {}));
            }));
        });
        it("property - generalization of increasing parameter specifialization", function () {
            jsverify.assert(jsverify.forall(jsverify.nearray(jsverify.nestring), function (params) {
                const limited = R.drop(1, params);
                return value.generalizationOf(value("application", "json", R.fromPairs(R.zip(limited, limited))),
                                              value("application", "json", R.fromPairs(R.zip(params, params))));
            }));
        });
    });
});
