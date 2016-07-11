/*eslint no-unused-expressions: off*/
/*eslint max-statements: off*/
const {expect} = require("chai");
const {lib, parallel} = require("../loader");
const parseContent = lib(require, "multipart/parseContent");
const Parser = parallel(require, __filename);
const getFixture = require("./getFixture");

describe("Parser", function () {
    describe("with a boundary of \"abc\"", function () {
        const parser = new Parser("abc", function () {});

        it("has the correct boundary", function () {
            expect(Reflect.apply(Array.prototype.slice, parser.boundary, [])).to.eql([13, 10, 45, 45, 97, 98, 99]);
            expect(parser.boundaryChars).to.eql({10: true, 13: true, 45: true, 97: true, 98: true, 99: true});
        });
    });

    let parts;

    function partHandler(part) {
        return part.bufferContent().then(function (chunk) {
            part.buffer = chunk;
            return part;
        });
    }

    function beforeEachParseFixture(fixtureName, boundary) {
        boundary = boundary || "AaB03x";
        beforeEach(function () {
            const message = getFixture(fixtureName);
            return parseContent(message, boundary, partHandler).then(function (object) {
                parts = object;
            });
        });
    }

    describe("for a message with a content type and no filename", function () {
        beforeEachParseFixture("content_type_no_filename");

        it("correctly parses the text contents", function () {
            expect(parts.text).to.exist;
            expect(parts.text.buffer.toString()).to.eql("contents");
        });
    });

    describe("for a webkit style message boundary", function () {
        beforeEachParseFixture("webkit", "----WebKitFormBoundaryWLHCs9qmcJJoyjKR");

        it("correctly parses", function () {
            expect(parts._method.buffer.toString()).to.equal("put");
            expect(parts["profile[blog]"].buffer.toString()).to.equal("");
            expect(parts.media.buffer.toString()).to.equal("");
            expect(parts.commit.buffer.toString()).to.equal("Save");
        });
    });

    describe("for a binary file upload", function () {
        beforeEachParseFixture("binary");

        it("correctly parses the text parameters", function () {
            expect(parts["submit-name"].buffer.toString()).to.equal("Larry");
        });

        it("correctly parses the file name", function () {
            expect(parts.files).to.exist;
            expect(parts.files.filename).to.equal("rack-logo.png");
        });

        it("correctly parses the file content type", function () {
            expect(parts.files).to.exist;
            expect(parts.files.contentType).to.equal("image/png");
        });

        it("correctly parses the file's contents", function () {
            expect(parts.files).to.exist;
            expect(parts.files.buffer).to.exist;
            expect(parts.files.buffer.length).to.equal(26473);
        });
    });

    describe("for a text file upload", function () {
        beforeEachParseFixture("text");

        it("correctly parses the text parameters", function () {
            expect(parts["submit-name"].buffer.toString()).to.equal("Larry");
            expect(parts["submit-name-with-content"].buffer.toString()).to.equal("Berry");
        });

        it("correctly parses the file name", function () {
            expect(parts.files).to.exist;
            expect(parts.files.filename).to.equal("file1.txt");
        });

        it("correctly parses the file content type", function () {
            expect(parts.files).to.exist;
            expect(parts.files.contentType).to.equal("text/plain");
        });

        it("correctly parses the file's contents", function () {
            expect(parts.files).to.exist;
            expect(parts.files.buffer.toString()).to.equal("contents");
        });
    });

    describe("for a text file upload using IE-style filename", function () {
        beforeEachParseFixture("text_ie");

        it("correctly parses and clean up the file name", function () {
            expect(parts.files).to.exist;
            expect(parts.files.filename).to.equal("file1.txt");
        });

        it("correctly parses the file content type", function () {
            expect(parts.files).to.exist;
            expect(parts.files.contentType).to.equal("text/plain");
        });

        it("correctly parses the file's contents", function () {
            expect(parts.files).to.exist;
            expect(parts.files.buffer.toString()).to.equal("contents");
        });
    });

    describe("for a multipart/mixed message", function () {
        beforeEachParseFixture("mixed_files");

        it("correctly parses a text field", function () {
            expect(parts.foo).to.exist;
            expect(parts.foo.buffer.toString()).to.equal("bar");
        });

        it("correctly parses a nested multipart message", function () {
            expect(parts.files).to.exist;
            expect(parts.files.buffer.length).to.equal(252);
        });
    });

    describe("for a message with no file selected", function () {
        beforeEachParseFixture("none");

        it("returns the field as an empty string", function () {
            expect(parts.files).to.exist;
            expect(parts.files.buffer.toString()).to.equal("");
        });
    });

    describe("for a message with a filename with escaped quotes", function () {
        beforeEachParseFixture("filename_with_escaped_quotes");

        it("correctly parses the file name", function () {
            expect(parts.files).to.exist;
            expect(parts.files.filename).to.equal("escape \"quotes");
        });

        it("correctly parses the file content type", function () {
            expect(parts.files).to.exist;
            expect(parts.files.contentType).to.equal("application/octet-stream");
        });

        it("correctly parses the file's contents", function () {
            expect(parts.files).to.exist;
            expect(parts.files.buffer.toString()).to.equal("contents");
        });
    });

    describe("for a message with a filename with unescaped quotes", function () {
        beforeEachParseFixture("filename_with_unescaped_quotes");

        it("correctly parses the file name", function () {
            expect(parts.files).to.exist;
            expect(parts.files.filename).to.equal("escape \"quotes");
        });

        it("correctly parses the file content type", function () {
            expect(parts.files).to.exist;
            expect(parts.files.contentType).to.equal("application/octet-stream");
        });

        it("correctly parses the file's contents", function () {
            expect(parts.files).to.exist;
            expect(parts.files.buffer.toString()).to.equal("contents");
        });
    });

    describe("for a message with a filename with percent escaped quotes", function () {
        beforeEachParseFixture("filename_with_percent_escaped_quotes");

        it("correctly parses the file name", function () {
            expect(parts.files).to.exist;
            expect(parts.files.filename).to.equal("escape \"quotes");
        });

        it("correctly parses the file content type", function () {
            expect(parts.files).to.exist;
            expect(parts.files.contentType).to.equal("application/octet-stream");
        });

        it("correctly parses the file's contents", function () {
            expect(parts.files).to.exist;
            expect(parts.files.buffer.toString()).to.equal("contents");
        });
    });

    describe("for a message with a filename and modification-date param", function () {
        beforeEachParseFixture("filename_and_modification_param");

        it("correctly parses the file name", function () {
            expect(parts.files).to.exist;
            expect(parts.files.filename).to.equal("genome.jpeg");
        });

        it("correctly parses the file content type", function () {
            expect(parts.files).to.exist;
            expect(parts.files.contentType).to.equal("image/jpeg");
        });

        it("correctly parses the file's contents", function () {
            expect(parts.files).to.exist;
            expect(parts.files.buffer.toString()).to.equal("contents");
        });
    });

    describe("for a message with a filename with unescaped quotes and modification-date param", function () {
        beforeEachParseFixture("filename_with_unescaped_quotes_and_modification_param");

        it("correctly parses the file name", function () {
            expect(parts.files).to.exist;
            expect(parts.files.filename).to.equal("\"human\" genome.jpeg");
        });

        it("correctly parses the file content type", function () {
            expect(parts.files).to.exist;
            expect(parts.files.contentType).to.equal("image/jpeg");
        });

        it("correctly parses the file's contents", function () {
            expect(parts.files).to.exist;
            expect(parts.files.buffer.toString()).to.equal("contents");
        });
    });
});
