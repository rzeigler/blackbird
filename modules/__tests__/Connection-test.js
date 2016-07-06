const expect = require("expect");
const Connection = require("../Connection");

describe("a Connection that uses https", function () {
    let conn;
    beforeEach(function () {
        conn = new Connection("https://www.example.com");
    });

    it("is secure", function () {
        expect(conn.isSSL).toBe(true);
    });
});
