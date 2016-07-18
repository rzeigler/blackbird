const {expect} = require("chai");
const request = require("request-promise");
const serve = require("../src/core/serve");
const Promise = require("bluebird");

/* eslint no-process-env: 0 */
const port = parseInt(process.env.PORT || "8888", 10);
const host = `http://localhost:${port}`;

describe("core/serve", function () {
    describe("simplest possible", function () {
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
    describe("simplest possible promised", function () {
        let server = null;
        beforeEach(function () {
            server = serve.serve(port, function () {
                return Promise.resolve("Hello, World!").delay(500);
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
});
