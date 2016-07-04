/* jshint -W058 */
let expect = require("expect");
let mach = require("../../index");
let StatusCodes = require("../../StatusCodes");

describe("extensions/statusText", function () {

    beforeEach(function () {
        mach.extend(require("../statusText"));
    });

    describe("Connection#statusText", function () {

        let conn;
        beforeEach(function () {
            conn = new mach.Connection;
        });

        Object.keys(StatusCodes).forEach(function (status) {
            describe("with status " + status, function () {
                beforeEach(function () {
                    conn.status = status;
                });

                it("has the correct statusText", function () {
                    expect(conn.statusText).toEqual(status + " " + StatusCodes[status]);
                });
            });
        });

    });

});
