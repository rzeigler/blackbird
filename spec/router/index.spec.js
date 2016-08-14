const Promise = require("bluebird");
const R = require("ramda");
const {expect} = require("chai");
const {equal, deepEqual, notCalled} = require("../assert");
const {lib} = require("../loader");
const {router, corsDispatcher, path: {lit, any, nat, Path}} = lib(require, "router");
const {response: {response}, context: {urlStruct}} = lib(require, "core");

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
                app(urlStruct("/a/5")).then(deepEqual({id: 5})),
                app(urlStruct("/a/b/foo")).then(deepEqual({other: "foo"}))
            ])
        );
        it("should return 404 when no matches are available", () =>
             app(urlStruct("/b/c"))
                .then(notCalled("then"))
                .catch(deepEqual(response(404, {}, ""))));
        it("should descend into subrouters", () =>
            app(urlStruct("/a/b/c/1/d/foo"))
                .then(R.prop("params"))
                .then(deepEqual({id: "1", q: "foo"}))
        );
        it("should throw 404 when no matches are found in subrouters", () =>
            app(urlStruct("/a/b/c/1/e/foo"))
                .then(notCalled("then"))
                .catch(deepEqual(response(404, {}, "")))
        );
    });
    describe("dispatcher", () => {
        const app = corsDispatcher({
            get: R.always(response(200, {}, "get")),
            post: R.always(response(200, {}, "post")),
            delete: R.always(response(200, {}, "delete"))
        });
        it("should dispatch to the correct handler", () =>
            app({method: "POST", headers: {origin: "http://localhost"}})
                .then(R.prop("body"))
                .then(equal("post")));
        it("should return 404 when there are no matches found", () =>
            app({method: "PATCH"})
                .then(notCalled("then"))
                .catch(deepEqual(response(405, {}, ""))));
        it("should condition the response correctly", () =>
            app({method: "GET", headers: {origin: "http://localhost"}})
                .then(deepEqual(response(200, {
                    "Access-Control-Expose-Headers": "",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Headers": "",
                    "Access-Control-Allow-Methods": "get",
                    "Access-Control-Allow-Origin": "http://localhost"
                }, "get"))));
        it("should dispatch to the generated cors app", () =>
            app({
                method: "OPTIONS",
                headers: {
                    origin: "http://localhost",
                    "access-control-request-headers": "baz, bar"
                }
            }).then(deepEqual(response(200, {
                "Access-Control-Allow-Origin": "http://localhost",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Headers": "baz, bar",
                "Access-Control-Allow-Methods": "get, post, delete"
            }, null))));
    });
});
