const assert = require("assert");
const R = require("ramda");

const {parallel} = require("../loader");
const option = parallel(require, __filename);

describe("option", function () {
    describe("#inhabit", function () {
        it("should return some on defined value", function () {
            assert(option.inhabit(1).fold(R.T, R.F));
        });
        it("should return none on undefined value", function () {
            assert(option.inhabit(null).fold(R.F, R.T));
        });
    });
});
