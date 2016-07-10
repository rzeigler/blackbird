const expect = require("expect");
const BB = require("../../index");
const middleware = require("../../middleware");

describe("extensions/middleware", function () {
    beforeEach(function () {
        BB.extend(require("../middleware"));
    });

    Object.keys(middleware).forEach(function (property) {
        describe(`BB.${property}`, function () {
            it("is a function", function () {
                expect(BB[property]).toBeA("function");
            });
        });
    });
});
