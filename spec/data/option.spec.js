const {expect} = require("chai");
const {None, Some} = require("fantasy-options");

const {parallel} = require("../loader");
const option = parallel(require, __filename);

describe("data/option", function () {
    describe("#inhabit", function () {
        it("should return some on defined value", function () {
            expect(option.inhabit(1)).to.eql(Some(1));
        });
        it("should return none on undefined value", function () {
            expect(option.inhabit(null)).to.eql(None);
        });
        it("should be identity on an existing Option", function () {
            expect(option.inhabit(None)).to.eql(None);
        });
    });
});
