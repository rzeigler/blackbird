const R = require("ramda");
const Promise = require("bluebird");
const {expect} = require("chai");
const request = require("request-promise");
const {serve, response} = require("../src/core");
const {negotiator, responder, codecs} = require("../src/negotiator");

/* eslint no-process-env: 0 */
const port = parseInt(process.env.PORT || "8888", 10);
const host = `http://localhost:${port}`;

describe("negotiator", () => {
    let server = null;
    beforeEach(() =>
        serve(port, negotiator([
            responder(codecs.jsonDecoder, codecs.plainTextEncoder,
                (ctx) => Promise.resolve(response.response(200, {}, ctx.body.message))),
            responder(codecs.plainTextDecoder, codecs.jsonEncoder,
                (ctx) => Promise.resolve(response.respnose(200, {}, {message: ctx.body})))
        ]))
        .then((srv) => {
            server = srv;
        })
    );

    afterEach(function () {
        server.close();
    });

    it("should return plain text when json is submitted", function () {
        console.log("executing test");
        request({uri: host, body: "hello", headers: {"Content-Type": "text/plain", Accept: "application/json"}})
            .then((text) => {
                // console.log(text);
                expect(text).to.equal("{\"message\": \"hello\"}");
            })
            .catch((e) => {
                // console.error(e);
                expect(true).to.equal(false);
            });
    });
});
