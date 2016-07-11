const expect = require("expect");
const {lib, parallel} = require("../loader");
const BB = lib(require, "index");

describe("extensions/acceptEncoding", function () {
    beforeEach(function () {
        BB.extend(parallel(require, __filename));
    });

    describe("a message with an Accept-Encoding header", function () {
        let message;
        beforeEach(function () {
            message = new BB.Message(null, {"Accept-Encoding": "gzip"});
        });

        it("accepts acceptable encodings", function () {
            expect(message.acceptsEncoding("gzip")).toBe(true);
        });

        it("does not accept unacceptable encodings", function () {
            expect(message.acceptsEncoding("compress")).toBe(false);
        });
    });
});
