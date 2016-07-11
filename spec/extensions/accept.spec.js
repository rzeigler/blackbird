const expect = require("expect");
const {lib, parallel} = require("../loader");
const BB = lib(require, "index");

describe("extensions/accept", function () {
    beforeEach(function () {
        BB.extend(parallel(require, __filename));
    });

    describe("a message with an Accept header", function () {
        let message;
        beforeEach(function () {
            message = new BB.Message(null, {Accept: "application/json"});
        });

        it("accepts acceptable media types", function () {
            expect(message.accepts("application/json")).toBe(true);
        });

        it("does not accept unacceptable media types", function () {
            expect(message.accepts("text/html")).toBe(false);
        });
    });
});
