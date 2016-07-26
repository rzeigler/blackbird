const {expect} = require("chai");
const {parallel} = require("../loader");
const R = require("ramda");
const context = parallel(require, __filename);

describe("core", () => {
    describe("context", () => {
        describe("urlStruct", () => {
            it("should decompose paths", function () {
                expect(context.urlStruct("/a/b/c?q=1&b="))
                    .to.eql({path: "/a/b/c", pathSplit: ["a", "b", "c"], query: {q: "1", b: ""}});
            });
        });
        describe("overContextParams", () => {
            it("should over the params", () => {
                expect(context.overContextParams(R.merge({a: 1}), {params: {b: 2}}))
                    .to.eql({params: {a: 1, b: 2}});
            });
        });
    });
});
