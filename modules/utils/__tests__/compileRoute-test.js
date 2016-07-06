const assert = require("assert");
const expect = require("expect");
const compileRoute = require("../compileRoute");

describe("compileRoute", function () {
    let keys;
    beforeEach(function () {
        keys = [];
    });

    describe("when a pattern contains named keys", function () {
        it("populates the keys array with the values", function () {
            compileRoute("/users/:userID/posts/:postID", keys);
            expect(keys).toEqual(["userID", "postID"]);
        });
    });

    describe("when a pattern contains *s", function () {
        it("has splat keys", function () {
            compileRoute("/files/*.*", keys);
            expect(keys).toEqual(["splat", "splat"]);
        });

        it("matches correctly", function () {
            const re = compileRoute("/files/*.*", keys);
            assert(re.exec("/files/fun.jpg"));
            assert(!re.exec("/files/fun"));
        });
    });

    describe("a pattern with ()", function () {
        it("has the correct keys", function () {
            compileRoute("/users/(:userID)", keys);
            expect(keys).toEqual(["userID"]);
        });

        it("matches correctly", function () {
            const re = compileRoute("/users/(:userID)", keys);
            assert(!re.exec("/users/5"));
            assert(re.exec("/users/(5)"));
        });
    });

    describe("a pattern with ^ and $", function () {
        it("has the correct keys", function () {
            compileRoute("/user$/^:userID", keys);
            expect(keys).toEqual(["userID"]);
        });

        it("matches correctly", function () {
            const re = compileRoute("/user$/^:userID", keys);
            assert(!re.exec("/user$/5"));
            assert(re.exec("/user$/^5"));
        });
    });
});
