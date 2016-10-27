const {expect} = require("chai");
const {parallel} = require("../loader");
const {Right, Left} = require("fantasy-eithers");
const {encodeJson, decodeJson} = parallel(require, __filename);

describe("codecs", () => {
    describe("decodeJson", () => {
        it("should return a right on valid json", () => {
            expect(decodeJson({}, Buffer.from(JSON.stringify({a: 1}))))
                .to.eql(Right({a: 1}));
        });
        it("should return a left on invalid json", () => {
            expect(decodeJson({}, Buffer.from("q'")))
            .to.be.instanceof(Left);
        });
    });
    describe("encodeJson", () => {
        it("should return a string representation of an object", () => {
            expect(encodeJson({}, {a: 1}))
            .to.eql(Buffer.from(JSON.stringify({a: 1})));
        });
    });
});
