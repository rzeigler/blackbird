const Promise = require("bluebird");
const R = require("ramda");
const {expect} = require("chai");
const {lib} = require("../loader");
const {router, dispatcher, path: {lit, any, path, nat}} = lib(require, "router");
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
        it("should invoke the correct function for a path match", () =>
            // urlStruct contains the necessary pieces of context for the router to function
            Promise.all([
                app(urlStruct("/a/5")).then((r) => expect(r).to.eql({id: 5})),
                app(urlStruct("/a/b/foo")).then((r) => expect(r).to.eql({other: "foo"}))
            ])
        );
        it("should return 404 when no matches are available", () =>
             app(urlStruct("/b/c"))
                .then(() => expect(true).to.equal(false))
                .catch((v) => expect(v).to.eql(response(404, {}, ""))));
        it("should descend into subrouters", () =>
            app(urlStruct("/a/b/c/1/d/foo"))
                .then((result) => expect(result.params).to.eql({id: "1", q: "foo"}))
        );
        it("should throw 404 when no matches are found in subrouters", () =>
            app(urlStruct("/a/b/c/1/e/foo"))
                .then(() => expect(true).to.equal(false))
                .catch((v) => expect(v).to.eql(response(404, {}, "")))
        );
    });
    describe("dispatcher", () => {
        const app = dispatcher([
            ["get", R.compose(R.toLower, R.prop("method"))],
            ["post", R.compose(R.toLower, R.prop("method"))],
            ["delete", R.compose(R.toLower, R.prop("method"))]
        ]);
        it("should dispatch to the correct handler", () =>
            app({method: "POST"})
                .then((v) => expect(v).to.equal("post")));
        it("should return 404 when there are no matches found", () =>
            app({method: "PATCH"})
                .then(() => expect(true).to.equal(false))
                .catch((v) => expect(v).to.eql(response(405, {}, ""))));
    });
});
