const expect = require("expect");
const {lib, parallel} = require("../loader");
const BB = lib(require, "index");

describe("extensions/proxy", function () {
    beforeEach(function () {
        BB.extend(parallel(require, __filename));
    });

    describe("BB.createProxy", function () {
        it("is a function", function () {
            expect(BB.createProxy).toBeA("function");
        });
    });
});
