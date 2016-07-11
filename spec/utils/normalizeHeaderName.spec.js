const expect = require("expect");
const {lib, parallel} = require("../loader");
const IrregularHeaderNames = lib(require, "utils/IrregularHeaderNames");
const normalizeHeaderName = parallel(require, __filename);

describe("normalizeHeaderName", function () {
    it("correctly normalizes Content-Type", function () {
        expect(normalizeHeaderName("content-type")).toEqual("Content-Type");
    });

    Object.keys(IrregularHeaderNames).forEach(function (key) {
        const headerName = IrregularHeaderNames[key];

        it(`correctly normalizes ${headerName}`, function () {
            expect(normalizeHeaderName(key)).toEqual(headerName);
        });
    });
});
