const {expect} = require("chai");
const request = require("request-promise");
const serve = require("../src/core/serve");

/* eslint no-process-env: 0 */
const port = parseInt(process.env.PORT || "8888", 10);
const host = `http://localhost:${port}`;

describe("core/serve", function () {
    let server = null;
    beforeEach(function () {
        server = serve.serve(port, function () {
            return "Hello, World!";
        });
    });

    afterEach(function () {
        server.close();
    });

    it("should response with hello world", function () {
        return request(host)
            .then((text) => expect(text).to.equal("Hello, World!"));
    });
});
