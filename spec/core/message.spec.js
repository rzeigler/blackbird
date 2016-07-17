const {expect} = require("chai");
const {parallel} = require("../loader");
const message = parallel(require, __filename);

describe("core/message", function () {
    describe("#inflateBufferBody", function () {
        it("should inflate a response structure from a buffer", function () {
            const buffer = Buffer.from("abcdefg");
            const result = message.inflateBufferBody(buffer);
            expect(result.statusCode).to.equal(200);
            expect(result.headers).to.eql({"content-type": "application/octet-stream"});
            expect(result.body).to.equal(buffer);
        });
    });
    describe("#inflateStringBody", function () {
        it("should inflate a response structure from a string", function () {
            const inflated = message.inflateStringBody("abcdefg");
            expect(inflated.statusCode).to.equal(200);
            expect(inflated.headers).to.eql({"content-type": "text/plain; charset=utf-8"});
            expect(inflated.body).to.eql(Buffer.from("abcdefg"));
        });
    });
});
