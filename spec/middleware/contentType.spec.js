const expect = require("expect");
const {lib, parallel} = require("../loader");
const callApp = lib(require, "utils/callApp");
const contentType = parallel(require, __filename);

function ok() {
    return 200;
}

describe("middleware/contentType", function () {
    it("adds a Content-Type header", function () {
        return callApp(contentType(ok, "text/plain"), "/").then(function (conn) {
            expect(conn.response.headers["Content-Type"]).toEqual("text/plain");
        });
    });
});
