const assert = require("assert");

const {lib, parallel} = require("../loader");
const parser = parallel(require, __filename);
const value = lib(require, "media/value");

describe("media-parser", () => {
    describe("#mediaType", () => {
        it("should recognize mime types", () => {
            assert.deepEqual(parser.mediaType.parse("application/json"), {
                status: true,
                value: value("application", "json", {})
            });
        });
        it("should recognize parameterized media types", () => {
            assert.deepEqual(parser.mediaType.parse("application/json; q=1; b=r"), {
                status: true,
                value: value("application", "json", {q: "1", b: "r"})
            });
        });
        it("should recognize vendor types", () => {
            assert.deepEqual(parser.mediaType.parse("application/vnd.company.user"), {
                status: true,
                value: value("application", "vnd.company.user", {})
            });
        });
        it("should recognize parameterized vendor types", () => {
            assert.deepEqual(parser.mediaType.parse("application/vnd.company.user; q=1"), {
                status: true,
                value: value("application", "vnd.company.user", {q: "1"})
            });
        });
    });
    describe("#accept", () => {
        it("should recognize a list of media types", () => {
            assert.deepEqual(parser.accept.parse("text/plain, text/html"), {
                status: true,
                value: [value("text", "plain", {}), value("text", "html", {})]
            });
        });
        it("should recognize a list of parameterized media types", () => {
            assert.deepEqual(parser.accept.parse("application/json; encoding=utf8, application/xml; xmlns=a"), {
                status: true,
                value: [
                    value("application", "json", {encoding: "utf8"}),
                    value("application", "xml", {xmlns: "a"})
                ]
            });
        });
    });
});
