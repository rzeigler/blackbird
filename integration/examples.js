const BB = require("../src");
const R = require("ramda");
const {expect} = require("chai");
const request = require("request-promise");
const base64 = require("base-64");

const port = parseInt(process.env.PORT || "8888", 10);
const host = `http://localhost:${port}`;

describe("simple server", function () {
    describe("hello world", function () {
        let server = null;
        beforeEach(function () {
            server = BB.serve(function () {
                return "Hello, World!";
            }, {port});
        });

        afterEach(function () {
            server.close();
        });

        it("should response with hello world", function () {
            return request(host)
                .then((text) => expect(text).to.equal("Hello, World!"));
        });
    });
    describe("basic auth", function () {
        let server = null;
        beforeEach(function () {
            const app = BB.stack();

            app.use(BB.logger);
            app.use(BB.basicAuth, function (user, pass) {
              // Allow anyone to login, as long as they use the password "password".
                return pass === "password";
            });

            app.run(function (conn) {
                return `Hello ${conn.remoteUser}!`;
            });

            server = BB.serve(app, {port});
        });

        afterEach(function () {
            server.close();
        });

        function basicAuthCredentials(username, password) {
            return base64.encode(`${username}:${password}`);
        }

        function basicAuthHeader(username, password) {
            return `Basic ${basicAuthCredentials(username, password)}`;
        }

        it("should response with content to a correct password", function () {
            return request({uri: host, headers: {Authorization: basicAuthHeader("ryan", "password")}})
                .then((text) => expect(text).to.equal("Hello ryan!"));
        });

        it("should response with unauthorized to an incorrect password", function () {
            return request({uri: host, headers: {Authorization: basicAuthHeader("ryan", "wrong password")}})
                .then(R.always(Promise.reject(new Error("Failed to receive 401"))))
                .catch((e) => expect(e.statusCode).to.equal(401));
        });
    });
});
