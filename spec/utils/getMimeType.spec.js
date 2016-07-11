const expect = require("expect");
const {lib, parallel} = require("../loader");
const MimeTypes = lib(require, "MimeTypes");
const getMimeType = parallel(require, __filename);

describe("getMimeType", function () {
    Object.keys(MimeTypes).forEach(function (type) {
        MimeTypes[type].forEach(function (ext) {
            describe(`when given a file with a "${ext}" extension`, function () {
                it("returns the correct mime type", function () {
                    expect(getMimeType(`file.${ext}`)).toEqual(type);
                });
            });
        });
    });

    describe("when given a file with an unknown extension", function () {
        describe("and a default type is given", function () {
            it("returns the default type", function () {
                expect(getMimeType("file.unknown-type", "text/html")).toEqual("text/html");
            });
        });

        describe("and a default type is not given", function () {
            it("returns application/octet-stream", function () {
                expect(getMimeType("file.unknown-type")).toEqual("application/octet-stream");
            });
        });
    });
});
