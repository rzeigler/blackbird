const R = require("ramda");
const {expect} = require("chai");
const {lib} = require("../loader");
const {router, path: {lit, any, path, nat}} = lib(require, "router");
const {message: {urlStruct, response}} = lib(require, "core");

describe("router", () => {
    describe("router", () => {
        const app = router([
            path([lit("a"), nat("id")], R.prop("params")),
            path([lit("a"), lit("b"), any("other")], R.prop("params")),
            path([lit("a"), lit("b"), lit("c"), any("id")],
                    router([
                        path([lit("d"), any("q")], R.identity)
                    ]), true)
        ]);
        it("should invoke the correct function for a path match", () => {
            // urlStruct contains the necessary pieces of context for the router to function
            expect(app(urlStruct("/a/5"))).to.eql({id: 5});
            expect(app(urlStruct("/a/b/foo"))).to.eql({other: "foo"});
        });
        it("should return 404 when no matches are available", () =>
             app(urlStruct("/b/c"))
                .then((v) => expect(v).to.eql(response(404, {}, ""))));
        it("should descend into subrouters", () => {
            const result = app(urlStruct("/a/b/c/1/d/foo"));
            expect(result.params).to.eql({id: "1", q: "foo"});
        });
        it("should throw 404 when no matches are found in subrouters", () => {
            const result = app(urlStruct("/a/b/c/1/e/foo"));
            return result.then((v) => expect(v).to.eql(response(404, {}, "")));
        });
    });
});
