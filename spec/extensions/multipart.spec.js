const {expect} = require("chai");
const {lib, parallel} = require("../loader");
const BB = lib(require, "index");

const getFixture = require("../multipart/getFixture");

describe("extensions/multipart", function () {
    beforeEach(function () {
        BB.extend(parallel(require, __filename));
    });

    let message;

    describe("a multipart message", function () {
        beforeEach(function () {
            message = new BB.Message(
        getFixture("content_type_no_filename"),
                {"Content-Type": "multipart/form-data; boundary=AaB03x"}
      );
        });

        it("knows its multipart boundary", function () {
            expect(message.multipartBoundary).to.equal("AaB03x");
        });

        it("parses its content correctly", function () {
            return message.parseContent().then(function (params) {
                expect(params.text).to.equal("contents");
            });
        });
    });

    describe("a message that is part of a multipart message", function () {
        beforeEach(function () {
            message = new BB.Message(
        "contents",
                {"Content-Disposition": "form-data; name=\"files\"; filename=\"escape \\\"quotes\""}
      );
        });

        it("knows its name", function () {
            expect(message.name).to.equal("files");
        });

        it("knows its filename", function () {
            expect(message.filename).to.equal("escape \"quotes");
        });
    });
});
