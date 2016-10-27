const Promise = require("bluebird");
const {expect} = require("chai");
const request = require("request-promise");
const {serve, response} = require("../src/core");
const {negotiator, responder, codecs} = require("../src/negotiator");

/* eslint no-process-env: 0 */
const port = parseInt(process.env.PORT || "8888", 10);
const host = `http://localhost:${port}`;

describe("negotiator", () => {
    describe("simple cases", () => {
        let server = null;
        beforeEach((done) => {
            serve(port, negotiator([
                responder(codecs.jsonDecoder, codecs.plainTextEncoder,
                    (ctx) => Promise.resolve(response.response(200, {}, ctx.body.message))),
                responder(codecs.plainTextDecoder, codecs.jsonEncoder,
                    (ctx) => Promise.resolve(response.response(200, {}, {message: ctx.body})))
            ]))
            .then((srv) => {
                server = srv;
                done();
            })
            .catch(done);
        });

        afterEach(function () {
            server.close();
        });

        it("should return plain text when json is submitted given accept headers", () =>
            request({uri: host, body: "hello", headers: {"Content-Type": "text/plain", Accept: "application/json"}})
                .catch(() => {
                    expect(true).to.equal(false);
                })
                .then((text) => {
                    expect(text).to.equal(JSON.stringify({message: "hello"}));
                })
        );

        it("should return json when plain text is submitted", () =>
            request({
                uri: host,
                body: JSON.stringify({message: "hello"}),
                headers: {"Content-Type": "application/json", Accept: "text/plain"}
            })
                .catch((e) => {
                    console.log(e);
                    expect(true).to.equal(false);
                })
                .then((text) => {
                    expect(text).to.equal("hello");
                })
        );

        it("should error with 415 for an unspected content-type", () =>
            request({uri: host, body: "booo", headers: {"Content-Type": "text/tex", Accept: "text/plain"}})
                .then(() => expect(false).to.equal(true))
                .catch((e) => expect(e.statusCode).to.equal(415))
        );
        it("should error with 406 for an unexpected accept", () =>
            request({uri: host, body: "booo", headers: {"Content-Type": "text/plain", Accept: "text/tex"}})
                .then(() => expect(false).to.equal(true))
                .catch((e) => expect(e.statusCode).to.equal(406))
        );
    });
});
