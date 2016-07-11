const expect = require("expect");
const {lib, parallel} = require("../loader");
const BB = lib(require, "index");
const middleware = lib(require, "middleware");

describe("extensions/middleware", function () {
    beforeEach(function () {
        BB.extend(parallel(require, __filename));
    });

    Object.keys(middleware).forEach(function (property) {
        describe(`BB.${property}`, function () {
            it("is a function", function () {
                expect(BB[property]).toBeA("function");
            });
        });
    });
});
