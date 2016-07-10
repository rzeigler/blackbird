const {expect} = require("chai");
const should = require("chai").should();
const callApp = require("../../utils/callApp");
const favicon = require("../favicon");

function ok() {
    return 200;
}

describe("middleware/favicon", function () {
    describe("when /favicon.ico is requested", function () {
        it("returns 404", function () {
            return callApp(favicon(ok), "/favicon.ico").then(function (conn) {
                expect(conn.status).to.equal(404);
            });
        });
    });

    describe("when /favicon.ico?a=b is requested", function () {
        it("returns 404", function () {
            return callApp(favicon(ok), "/favicon.ico?a=b").then(function (conn) {
                expect(conn.status).to.equal(404);
            });
        });
    });
});
