const {expect} = require("chai");
const {encode} = require("base-64");
const {parallel, lib} = require("../loader");
const basicAuth = parallel(require, __filename);
const {makeResponse} = lib(require, "core");

describe("middleware", () => {
    describe("basic-auth", () => {
        describe("basicAuth", () => {
            const verify = (username, password) => {
                if (username === "ryan" && password === "pass") {
                    return true;
                }
                return false;
            };
            const auth = basicAuth("testing", verify);
            const app = (ctx) => Promise.resolve(ctx.auth);
            const decorated = auth(app);
            it("should reject when missing credentials", () =>
                decorated({headers: {}})
                    .then(() => expect(true).to.equal(false))
                    .catch((rsp) => expect(rsp).to.eql(makeResponse(401, {"WWW-Authenticate": "Basic realm=testing"},
                                                                    "Unauthorized")))
            );
            const wrong = "ryan:wrong";
            it("should reject when credentials are wrong", () =>
                decorated({headers: {authorization: `Basic ${encode(wrong)}`}})
                    .then(() => expect(true).to.equal(false))
                    .catch((rsp) => expect(rsp).to.eql(makeResponse(403, {}, "Forbidden")))
            );
            const right = "ryan:pass";
            it("should accept when credentials are correct", () =>
                decorated({headers: {authorization: `Basic ${encode(right)}`}})
                    .then((rsp) => expect(rsp).to.eql(true))
            );
        });
    });
});
