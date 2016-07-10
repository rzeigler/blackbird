const expect = require("expect");
const BB = require("../../index");

describe("extensions/proxy", function () {
    beforeEach(function () {
        BB.extend(require("../proxy"));
    });

    describe("BB.createProxy", function () {
        it("is a function", function () {
            expect(BB.createProxy).toBeA("function");
        });
    });
});
