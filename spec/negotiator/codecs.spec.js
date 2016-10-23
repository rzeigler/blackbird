const {expect} = require("chai");
const {parallel} = require("../loader");
const {Right, Left} = require("fantasy-eithers");
const {jsonDecoderImpl, jsonEncoderImpl} = parallel(require, __filename);

describe("codecs", () => {
    describe("jsonDecoderImpl", () => {
        it("should return a right on valid json", () => {
            expect(jsonDecoderImpl({}, Buffer.from(JSON.stringify({a: 1}))))
            .to.eql(Right({a: 1}));
        });
        it("should return a left on invalid json", () => {
            expect(jsonDecoderImpl({}, Buffer.from("q'")))
            .to.be.instanceof(Left);
        });
    });
    describe("jsonEncoderImpl", () => {
        it("should return a string representation of an object", () => {
            expect(jsonEncoderImpl({}, {a: 1}))
            .to.eql(Right([{
                parameters: {charset: "utf8"},
                subtype: "json",
                type: "application"
            }, Buffer.from(JSON.stringify({a: 1}))]));
        });
    });
});
