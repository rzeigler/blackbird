/* jshint -W058 */
const assert = require("assert");
const expect = require("expect");
const AcceptCharset = require("../AcceptCharset");

describe("AcceptCharset", function () {
    let header;

    describe("with no value", function () {
        beforeEach(function () {
            header = new AcceptCharset();
        });

        it("has the correct toString representation", function () {
            expect(header.toString()).toEqual("Accept-Charset: ");
        });

        it("has the correct quality factors", function () {
            expect(header.qualityFactorForCharset("iso-8859-1")).toEqual(1);
            expect(header.qualityFactorForCharset("iso-8859-5")).toEqual(0);
            expect(header.qualityFactorForCharset("unicode-1-1")).toEqual(0);
        });

        it("accepts iso-8859-1", function () {
            assert(header.accepts("iso-8859-1"));
        });

        it("does not accept other charsets", function () {
            assert(!header.accepts("iso-8859-5"));
            assert(!header.accepts("unicode-1-1"));
        });
    });

    describe("with a value of \"unicode-1-1;q=0.8, *;q=0.5\"", function () {
        beforeEach(function () {
            header = new AcceptCharset("unicode-1-1, *;q=0.5");
        });

        it("has the correct quality factors", function () {
            expect(header.qualityFactorForCharset("iso-8859-1")).toEqual(1);
            expect(header.qualityFactorForCharset("iso-8859-5")).toEqual(0.5);
            expect(header.qualityFactorForCharset("unicode-1-1")).toEqual(1);
        });

        it("accepts iso-8859-1", function () {
            assert(header.accepts("iso-8859-1"));
        });

        it("accepts iso-8859-5", function () {
            assert(header.accepts("iso-8859-5"));
        });

        it("accepts unicode-1-1", function () {
            assert(header.accepts("unicode-1-1"));
        });
    });
});
