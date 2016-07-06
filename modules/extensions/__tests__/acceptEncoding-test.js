const expect = require("expect");
const mach = require("../../index");

describe("extensions/acceptEncoding", function () {
    beforeEach(function () {
        mach.extend(require("../acceptEncoding"));
    });

    describe("a message with an Accept-Encoding header", function () {
        let message;
        beforeEach(function () {
            message = new mach.Message(null, {"Accept-Encoding": "gzip"});
        });

        it("accepts acceptable encodings", function () {
            expect(message.acceptsEncoding("gzip")).toBe(true);
        });

        it("does not accept unacceptable encodings", function () {
            expect(message.acceptsEncoding("compress")).toBe(false);
        });
    });
});
