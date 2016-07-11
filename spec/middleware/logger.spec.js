const assert = require("assert");
const expect = require("expect");
const {lib, parallel} = require("../loader");
const callApp = lib(require, "utils/callApp");
const logger = parallel(require, __filename);

function zeroLength() {
    return {headers: {"Content-Length": 0}};
}

describe("middleware/logger", function () {
    describe("when a response has Content-Length of 100", function () {
        let messages, messageHandler;
        beforeEach(function () {
            messages = [];
            messageHandler = function (message) {
                messages.push(message);
            };
        });

        it("logs a content length of 0", function () {
            return callApp(logger(zeroLength, messageHandler)).then(function () {
                assert(messages[0]);

                const match = messages[0].match(/\b(\d+) ([0-9\.]+)\b$/);
                assert(match);

                const contentLength = match[1];
                expect(contentLength).toEqual("0");
            });
        });
    });
});
