const assert = require("assert");
const expect = require("expect");
const {lib, parallel} = require("../loader");
const callApp = lib(require, "utils/callApp");
const token = parallel(require, __filename);
const params = lib(require, "middleware/params");
const session = lib(require, "middleware/session");
const stack = lib(require, "middleware/stack");

function extractCookie(setCookie) {
    const match = setCookie.match(/_session=[^;]+/);
    assert(match);
    return match[0];
}

describe("middleware/token", function () {
    const app = stack();
    app.use(session, {secret: "foo"});
    app.use(params);
    app.use(token);
    app.run(function (conn) {
        return conn.session._token;
    });

    describe("when the request parameters are missing the session token", function () {
        it("returns 403", function () {
            return callApp(app, {method: "POST"}).then(function (conn) {
                expect(conn.status).toEqual(403);
            });
        });
    });

    describe("when the request parameters contain the session token", function () {
        it("passes the request downstream", function () {
      // Call it twice. First time is to get the token and cookie.
            return callApp(app).then(function (conn) {
                const cookie = extractCookie(conn.response.headers["Set-Cookie"]);
                const token = conn.responseText;

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
