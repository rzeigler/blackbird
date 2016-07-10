/* jshint -W058 */
const expect = require("expect");
const BB = require("../../index");
const StatusCodes = require("../../StatusCodes");

describe("extensions/statusText", function () {
    beforeEach(function () {
        BB.extend(require("../statusText"));
    });

    describe("Connection#statusText", function () {
        let conn;
        beforeEach(function () {
            conn = new BB.Connection();
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
