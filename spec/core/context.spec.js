const {expect} = require("chai");
const {parallel} = require("../loader");
const R = require("ramda");
const {paramsLens, urlStruct} = parallel(require, __filename);

describe("core", () => {
    describe("context", () => {
        describe("urlStruct", () => {
            it("should decompose paths", function () {
                expect(urlStruct("/a/b/c?q=1&b="))
                    .to.eql({path: "/a/b/c", pathSplit: ["a", "b", "c"], query: {q: "1", b: ""}});
            });
        });
        describe("overContextParams", () => {
            it("should over the params", () => {
                expect(R.over(paramsLens, R.merge({a: 1}), {params: {b: 2}}))
                    .to.eql({params: {a: 1, b: 2}});
            });
        });
    });
});
