const expect = require("expect");
const {lib, parallel} = require("../loader");
const BB = lib(require, "index");

describe("extensions/acceptCharset", function () {
    beforeEach(function () {
        BB.extend(parallel(require, __filename));
    });

    describe("a message with an Accept-Charset header", function () {
        let message;
        beforeEach(function () {
            message = new BB.Message(null, {"Accept-Charset": "unicode-1-1"});
        });

        it("accepts acceptable charsets", function () {
            expect(message.acceptsCharset("unicode-1-1")).toBe(true);
        });

        it("does not accept unacceptable charsets", function () {
            expect(message.acceptsCharset("iso-8859-5")).toBe(false);
        });
    });
});
