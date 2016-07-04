let expect = require("expect");
let IrregularHeaderNames = require("../IrregularHeaderNames");
let normalizeHeaderName = require("../normalizeHeaderName");

describe("normalizeHeaderName", function () {

    it("correctly normalizes Content-Type", function () {
        expect(normalizeHeaderName("content-type")).toEqual("Content-Type");
    });

    Object.keys(IrregularHeaderNames).forEach(function (key) {
        let headerName = IrregularHeaderNames[key];

        it("correctly normalizes " + headerName, function () {
            expect(normalizeHeaderName(key)).toEqual(headerName);
        });
    });

});
