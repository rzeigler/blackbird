let expect = require("expect");
let gzip = require("../gzip");
let callApp = require("../../utils/callApp");
let getFixture = require("./getFixture");

describe("middleware/gzip", function () {
    let contents = getFixture("test.txt");
    let gzippedContents = getFixture("test.txt.gz");
    let app = gzip(function () {
        return {
            headers: {"Content-Type": "text/plain"},
            content: contents
        };
    });

    describe("when the client accepts gzip encoding", function () {
        it("gzip-encodes the response", function () {
            return callApp(app, {
                headers: {"Accept-Encoding": "gzip"},
                binary: true
            }).then(function (conn) {
                expect(conn.response.headers["Content-Encoding"]).toEqual("gzip");
                expect(conn.response.headers["Vary"]).toEqual("Accept-Encoding");
                return conn.response.bufferContent().then(function (buffer) {
                    expect(buffer).toEqual(gzippedContents);
                });
            });
        });
    });

    describe("when the client does not accept gzip encoding", function () {
        it("does not encode the content", function () {
            return callApp(app, {
                binary: true
            }).then(function (conn) {
                return conn.response.bufferContent().then(function (buffer) {
                    expect(buffer).toEqual(contents);
                });
            });
        });
    });

    describe("when the response is a text/event-stream", function () {
        let app = gzip(function () {
            return {
                headers: {"Content-Type": "text/event-stream"},
                content: contents
            };
        });

        it("does not encode the content", function () {
            return callApp(app, {
                binary: true
            }).then(function (conn) {
                return conn.response.bufferContent().then(function (buffer) {
                    expect(buffer).toEqual(contents);
                });
            });
        });
    });
});
