const assert = require("assert");
const R = require("ramda");

const option = require("../option");

describe("option", function () {
    describe("#guard", function () {
        it("should return some on defined value", function () {
            assert(option.guard(1).fold(R.T, R.F));
        });
        it("should return none on undefined value", function () {
            assert(option.guard(null).fold(R.F, R.T));
        });
    });
});
