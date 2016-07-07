/* jshint -W058 */
const expect = require("expect");
const mach = require("../../index");
const StatusCodes = require("../../StatusCodes");

describe("extensions/statusText", function () {
    beforeEach(function () {
        mach.extend(require("../statusText"));
    });

    describe("Connection#statusText", function () {
        let conn;
        beforeEach(function () {
            conn = new mach.Connection();
        });

        Object.keys(StatusCodes).forEach(function (status) {
            describe(`with status ${status}`, function () {
                beforeEach(function () {
                    conn.status = status;
                });

                it("has the correct statusText", function () {
                    expect(conn.statusText).toEqual(`${status} ${StatusCodes[status]}`);
                });
            });
        });
    });
});
