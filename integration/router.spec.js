const {expect} = require("chai");
const jsverify = require("jsverify");
const request = require("request-promise");
const {serve, context, response, body} = require("../src/core");
const {router, path} = require("../src/router");
const Promise = require("bluebird");
const R = require("ramda");

/* eslint no-process-env: 0 */
const port = parseInt(process.env.PORT || "8888", 10);
const host = `http://localhost:${port}`;

describe("router", () => {
    beforeEach(() => {
        let a = 0, b = 0;
        server = server.serve(port, router([

        ]));
    });
    describe("routing & dispatching", () => {

    });
});
