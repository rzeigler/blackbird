let assert = require("assert");
let expect = require("expect");
let callApp = require("../../utils/callApp");
let params = require("../params");
let session = require("../session");
let stack = require("../stack");
let token = require("../token");

function extractCookie(setCookie) {
    let match = setCookie.match(/_session=[^;]+/);
    assert(match);
    return match[0];
}

describe("middleware/token", function () {

    let app = stack();
    app.use(session, {secret: "foo"});
    app.use(params);
    app.use(token);
    app.run(function (conn) {
        return conn.session._token;
    });

    describe("when the request parameters are missing the session token", function () {
        it("returns 403", function () {
            return callApp(app, {
                method: "POST"
            }).then(function (conn) {
                expect(conn.status).toEqual(403);
            });
        });
    });

    describe("when the request parameters contain the session token", function () {
        it("passes the request downstream", function () {
      // Call it twice. First time is to get the token and cookie.
            return callApp(app).then(function (conn) {
                let cookie = extractCookie(conn.response.headers["Set-Cookie"]);
                let token = conn.responseText;

                return callApp(app, {
                    method: "POST",
                    headers: {Cookie: cookie},
                    params: {_token: token}
                }).then(function (conn) {
                    expect(conn.status).toEqual(200);
                });
            });
        });
    });

    describe("when the request is not a POST", function () {
        it("passes the request downstream", function () {
            return callApp(app).then(function (conn) {
                expect(conn.status).toEqual(200);
            });
        });
    });

});
