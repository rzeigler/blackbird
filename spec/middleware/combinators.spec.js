const R = require("ramda");
const {expect} = require("chai");
const {parallel} = require("../loader");
const middleware = parallel(require, __filename);

describe("middleware", () => {
    const app = (ctx) => Promise.resolve(ctx.v);
    const preMiddle = middleware.pre((ctx) => Promise.resolve(R.assoc("v", ctx.v + 1, ctx)));
    const postMiddle = middleware.post((v) => Promise.resolve(v + 1));
    describe("pre", () => {
        it("should run a function on input", () =>
            preMiddle(app)({v: 1}).then((v) => expect(v).to.equal(2))
        );
    });
    describe("post", () => {
        it("should run a function on output", () =>
            postMiddle(app)({v: 1}).then((v) => expect(v).to.equal(2))
        );
    });
    describe("applyStack", () => {
        it("should sequence all middlewares", () =>
            middleware.applyStack([preMiddle, postMiddle], app)({v: 1})
                .then((v) => expect(v).to.equal(3))
        );
    });
});
