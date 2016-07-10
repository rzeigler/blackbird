const expect = require("expect");
const BB = require("../../index");

describe("extensions/acceptLanguage", function () {
    beforeEach(function () {
        BB.extend(require("../acceptLanguage"));
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
