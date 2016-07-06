const expect = require("expect");
const callApp = require("../../utils/callApp");
const basicAuth = require("../basicAuth");

function ok() {
    return 200;
}

function validateCredentials(username, password) {
    return username === "michael" && password === "password";
}

describe("middleware/basicAuth", function () {
    let app;
    beforeEach(function () {
        app = basicAuth(ok, validateCredentials);
    });

    describe("when no authentication credentials are given", function () {
        it("returns 401 Unauthorized", function () {
            return callApp(app).then(function (conn) {
                expect(conn.status).toEqual(401);
            });
        });
    });

    describe("when invalid authentication credentials are given", function () {
        it("returns 401 Unauthorized", function () {
            return callApp(app, "/", function (conn) {
                conn.auth = "michael:wrongPassword";
            }).then(function (conn) {
                expect(conn.status).toEqual(401);
            });
        });
    });

    describe("when valid credentials are given", function () {
        it("returns 200 OK", function () {
            return callApp(app, "/", function (conn) {
                conn.auth = "michael:password";
            }).then(function (conn) {
                expect(conn.status).toEqual(200);
            });
        });
    });
});
