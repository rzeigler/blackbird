const {expect} = require("chai");
const {parallel, lib} = require("../loader");
const {
    stringCoercion,
    isMember,
    attemptParamConstraint,
    defineParamConstraint,
    attemptMediaConstraint,
    defineMediaConstraint,
    Some,
    None
} = parallel(require, __filename);
const {media} = lib(require, "./media");

describe("media", () => {
    describe("constraint", () => {
        describe("attemptParamConstraint", () => {
            const constraint = defineParamConstraint("charset", stringCoercion,
                                                     isMember(["utf8", "ascii"]), Some("utf8"));
            it("should return a Some when the parameter matches assumed values", () => {
                expect(attemptParamConstraint(constraint, {charset: "utf8"}))
                    .to.eql(Some({charset: "utf8"}));
            });
            it("should return a None when the parameters do not match", () => {
                expect(attemptParamConstraint(constraint, {charset: "koi-8"}))
                    .to.eql(None);
            });
            it("should return a Some when the param is missing and defaults are available", () => {
                expect(attemptParamConstraint(constraint, {}))
                    .to.eql(Some({charset: "utf8"}));
            });
            it("should return a None when the param is missing and defaults are unavailable", () => {
                expect(attemptParamConstraint(
                    defineParamConstraint("charset", stringCoercion, isMember(["utf8", "ascii"]), None),
                    {}
                )).to.eql(None);
            });
        });
        describe("attemptMediaConstraint", () => {
            const mediaConstraint = defineMediaConstraint("application", "json", [
                defineParamConstraint("charset", stringCoercion, isMember(["utf8"]), Some("utf8"))
            ], true);
            it("should return Some for suitable matches", () => {
                expect(attemptMediaConstraint(mediaConstraint, media("application", "json", {charset: "utf8"})))
                    .to.eql(Some(media("application", "json", {charset: "utf8"})));
            });
            it("should return Some for suitable matches with defaulting params", () => {
                expect(attemptMediaConstraint(mediaConstraint, media("application", "json", {})))
                    .to.eql(Some(media("application", "json", {charset: "utf8"})));
            });
            it("should return Some for unrecognized parameter constraints when the flag is present", () => {
                expect(attemptMediaConstraint(mediaConstraint, media("application", "json", {random: "5"})))
                    .to.eql(Some(media("application", "json", {charset: "utf8"})));
            });
            it("should return None for unrecognized parameter constraints when the flag is missing", () => {
                const mediaConstraint = defineMediaConstraint("application", "json", [
                    defineParamConstraint("charset", stringCoercion, isMember(["utf8"]), Some("utf8"))
                ], false);
                expect(attemptMediaConstraint(mediaConstraint, media("application", "json", {random: "5"})))
                    .to.eql(None);
            });
            it("should return None for unmatchable parameters", () => {
                expect(attemptMediaConstraint(mediaConstraint, media("application", "json", {charset: "koi-8"})))
                    .to.eql(None);
            });
            it("should return None for unmatchable media types", () => {
                expect(attemptMediaConstraint(mediaConstraint, media("application", "json+patch", {charset: "utf8"})))
                    .to.eql(None);
            });
        });
    });
});
