const {expect} = require("chai");
const {parallel} = require("../loader");
const parser = parallel(require, __filename);

describe("headers/parser", function () {
    describe("#canonicalize", function () {
        it("should collect duplicate headers", function () {
            expect(parser.canonicalize([["a", "1"], ["b", "2"], ["a", "3"]]))
                .to.eql({a: "1, 3", b: "2"});
        });
    });
    describe("#headers", function () {
        const string = "Content-Type: text/plain\r\nX-Magic: 5\r\nContent-Disposition: attachment\r\n" +
            "X-Magic: 6\r\n\r\n";
        it("should parse a set of headers", function () {
            expect(parser.headers.parse(string))
                .to.eql({
                    status: true,
                    value: {
                        "Content-Type": "text/plain",
                        "X-Magic": "5, 6",
                        "Content-Disposition": "attachment"
                    }
                });
        });
    });
});
