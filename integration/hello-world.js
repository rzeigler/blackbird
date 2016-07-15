const BB = require("../src");
const {expect} = require("chai");
const request = require("request-promise");

const port = parseInt(process.env.PORT || "8888", 10);
const host = `http://localhost:${port}`;

describe("simple server", function () {
    describe("hello world", function () {
        let server = null;
        beforeEach(function () {
            server = BB.serve(function () {
                return "Hello, World!";
            }, {port});
        });

        afterEach(function () {
            server.close();
        });

        it("should response with hello world", function () {
            return request(host)
                .then((text) => expect(text).to.equal("Hello, World!"));
        });
    });
});
