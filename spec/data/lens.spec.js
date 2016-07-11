const {expect} = require("chai");
const Option = require("fantasy-options");
const R = require("ramda");
const {parallel} = require("../loader");
const lens = parallel(require, __filename);

describe("data/lens", function () {
    describe("#assocLens", function () {
        const aLens = lens.assocLens("a");
        it("should view a Some if the value is defined", function () {
            expect(R.view(aLens, {a: true}).fold(R.identity, R.always(false))).to.equal(true);
        });
        it("should view a None if the value is undefined", function () {
            expect(R.view(aLens, {b: true}).fold(R.identity, R.always(false))).to.equal(false);
        });
        xit("should set a value if a some is provided", function () {
            expect(R.set(aLens, new Option.Some(true), {a: false}).a).to.equal(true);
        });
        xit("should dissociate if a none is provided", function () {
            expect(R.set(aLens, Option.None, {a: false})).to.eql({});
        });
    });
});
