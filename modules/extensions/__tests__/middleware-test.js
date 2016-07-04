let expect = require("expect");
let mach = require("../../index");
let middleware = require("../../middleware");

describe("extensions/middleware", function () {

    beforeEach(function () {
        mach.extend(require("../middleware"));
    });

    Object.keys(middleware).forEach(function (property) {
        describe("mach." + property, function () {
            it("is a function", function () {
                expect(mach[property]).toBeA("function");
            });
        });
    });

});
