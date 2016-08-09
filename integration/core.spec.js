const {expect} = require("chai");
const jsverify = require("jsverify");
const request = require("request-promise");
const {serve, context, response, body} = require("../src/core");
const Promise = require("bluebird");
const R = require("ramda");

/* eslint no-process-env: 0 */
const port = parseInt(process.env.PORT || "8888", 10);
const host = `http://localhost:${port}`;

describe("core/serve", function () {
    describe("simplest possible", function () {
        let server = null;
        beforeEach(() =>
            serve(port, () => response.response(200, {}, "Hello, World!"))
            .then((srv) => {
                server = srv;
            })
        );

        afterEach(function () {
            server.close();
        });

        it("should responsd with hello world", function () {
            return request(host)
                .then((text) => expect(text).to.equal("Hello, World!"));
        });
    });
    describe("simplest possible promised", function () {
        let server = null;
        beforeEach(() =>
            serve(port, () => Promise.resolve(response.inflateResponse("Hello, World!")).delay(100))
            .then((srv) => {
                server = srv;
            })
        );

        afterEach(function () {
            server.close();
        });

        it("should respond with hello world", function () {
            return request(host)
                .then((text) => expect(text).to.equal("Hello, World!"));
        });
    });
    describe("failing server", function () {
        let server = null;
        beforeEach(() =>
            serve(port, function () {
                return Promise.reject(new TypeError("Explode!"));
            })
            .then((srv) => {
                server = srv;
            })
        );

        afterEach(function () {
            server.close();
        });

        it("should response with 500s", function () {
            return request(host)
                .then(() => expect(true).to.equal(false))
                .catch((e) => {
                    expect(e.statusCode).to.equal(500);
                    expect(e.error).to.equal("TypeError: Explode!");
                });
        });
    });

    describe("echo server", function () {
        let server = null;
        beforeEach(() => serve(port, (ctx) => context.consumeContextContent(body.buffer, ctx)
                    .then(response.inflateResponse))
                .then((srv) => {
                    server = srv;
                })
        );

        afterEach(function () {
            server.close();
        });

        it("should echo", function () {
            return jsverify.assert(jsverify.forall(jsverify.string, function (b) {
                return request({uri: host, body: b, json: false, method: "POST"})
                    .then(R.equals(b));
            }));
        });
    });
});
