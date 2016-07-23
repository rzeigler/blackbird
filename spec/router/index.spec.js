const Promise = require("bluebird");
const R = require("ramda");
const {expect} = require("chai");
const {lib} = require("../loader");
const {router, corsDispatcher, path: {lit, any, nat, Path}} = lib(require, "router");
const {message: {urlStruct, response}} = lib(require, "core");

describe("router", () => {
    describe("router", () => {
        const app = router([
            Path.Route([lit("a"), nat("id")], R.prop("params")),
            Path.Route([lit("a"), lit("b"), any("other")], R.prop("params")),
            Path.Tree([lit("a"), lit("b"), lit("c"), any("id")],
                    router([
                        Path.Route([lit("d"), any("q")], R.identity)
                    ]))
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
        const app = corsDispatcher({
            allowOrigin: "http://localhost:2000",
            allowHeaders: ["foo"],
            exposeHeaders: ["bar", "baz"]
        }, [["get", R.always(response(200, {}, "get"))],
            ["post", R.always(response(200, {}, "post"))],
            ["delete", R.always(response(200, {}, "delete"))]
        ]);
        it("should dispatch to the correct handler", () =>
            app({method: "POST"})
                .then((v) => expect(v.body).to.eql("post")));
        it("should return 404 when there are no matches found", () =>
            app({method: "PATCH"})
                .then(() => expect(true).to.equal(false))
                .catch((v) => expect(v).to.eql(response(405, {}, ""))));
        it("should condition the response correctly", () =>
            app({method: "GET"})
                .then((v) => expect(v).to.eql(response(200, {"Access-Control-Expose-Headers": "bar, baz"}, "get"))));
        it("should dispatch to the generated cors app", () =>
            app({method: "OPTIONS"})
                .then((v) => expect(v).to.eql(response(200, {
                    "Access-Control-Allow-Credentials": "false",
                    "Access-Control-Allow-Origin": "http://localhost:2000",
                    "Access-Control-Allow-Headers": "foo",
                    "Access-Control-Allow-Methods": "get, post, delete",
                    "Access-Control-Expose-Headers": "bar, baz"
                }, null))));
    });
});
