const expect = require("expect");
const {lib, parallel} = require("../loader");
const BB = lib(require, "index");

describe("extensions/acceptLanguage", function () {
    beforeEach(function () {
        BB.extend(parallel(require, __filename));
    });

    describe("a message with an Accept-Language header", function () {
        let message;
        beforeEach(function () {
            message = new BB.Message(null, {"Accept-Language": "jp"});
        });

        it("accepts acceptable languages", function () {
            expect(message.acceptsLanguage("jp")).toBe(true);
        });

        it("does not accept unacceptable languages", function () {
            expect(message.acceptsLanguage("da")).toBe(false);
        });
    });
});
