let expect = require("expect");
let mach = require("../../index");

describe("extensions/proxy", function () {

    beforeEach(function () {
        mach.extend(require("../proxy"));
    });

    describe("mach.createProxy", function () {
        it("is a function", function () {
            expect(mach.createProxy).toBeA("function");
        });
    });

});
