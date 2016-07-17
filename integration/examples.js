const BB = require("../src");
const R = require("ramda");
const path = require("path");
const {expect} = require("chai");
const request = require("request-promise");
const base64 = require("base-64");

/* eslint no-process-env: 0 */
const port = parseInt(process.env.PORT || "8888", 10);
const host = `http://localhost:${port}`;

describe("simple server", function () {
    describe("hello world", function () {
        let server = null;
        beforeEach(function () {
            server = BB.serve(function () {
                return "Hello, World!";
            }, {port, quiet: true});
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

            server = BB.serve(app, {port, quiet: true});
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
    describe("routing", function () {
        let server = null;
        beforeEach(function () {
            const app = BB.stack();

            const filePath = path.join(process.cwd(), "integration");

            app.use(BB.file, {root: filePath});
            // app.map("/ex", function (app) {
            //     app.use(BB.file, {root: filePath});
            // });
            app.use(BB.logger);


            app.get("/", function () {
                return "Hello world!";
            });

            app.get("/motd", function () {
                return "Be at peace.";
            });

            server = BB.serve(app, {port, quiet: true});
        });
        afterEach(function () {
            server.close();
        });

        it("should return expected data at the root", function () {
            return request(`${host}/`)
                .then((text) => expect(text).to.equal("Hello world!"));
        });

        it("should return expected data at /motd", function () {
            return request(`${host}/motd`)
                .then((text) => expect(text).to.equal("Be at peace."));
        });

        it("should send files successfully", function () {
            return request(`${host}/${path.basename(__filename)}`);
        });

        xit("should send files from a mount successfully", function () {
            return request(`${host}/ex/${path.basename(__filename)}`);
        });
    });
    describe("url matching", function () {
        let server = null;
        beforeEach(function () {
            const app = BB.stack();

            app.use(BB.logger);

            app.get("/", function () {
                return "/";
            });

            app.get("/b", function () {
                return "/b";
            });

            app.get("/c/:id", function (conn) {
                return JSON.stringify({
                    method: conn.method,
                    location: conn.location,
                    headers: conn.request.headers,
                    params: conn.params
                }, null, 2);
            });

            server = BB.serve(app, {port, quiet: true});
        });

        afterEach(function () {
            server.close();
        });

        it("should send expected content from the root", function () {
            return request(`${host}/`)
                .then((text) => expect(text).to.equal("/"));
        });
        it("should send expected content from /b", function () {
            return request(`${host}/b`)
                .then((text) => expect(text).to.equal("/b"));
        });
        it("should send expected content from /c/1", function () {
            return request(`${host}/c/1`)
                .then(JSON.parse)
                .then((response) => expect(response).to.deep.equal({
                    method: "GET",
                    location: `http://localhost:${port}/c/1`,
                    headers: {
                        Connection: "close",
                        Host: `localhost:${port}`
                    },
                    params: {id: "1"}
                }));
        });
    });
});
