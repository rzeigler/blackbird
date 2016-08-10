const {expect} = require("chai");
const request = require("request-promise");
const {serve, response} = require("../src/core");
const {router, dispatcher, path: {shorthand, Path}} = require("../src/router");
const Promise = require("bluebird");
const R = require("ramda");

/* eslint no-process-env: 0 */
const port = parseInt(process.env.PORT || "8888", 10);
const host = `http://localhost:${port}`;

describe("router", () => {
    let server = null;
    beforeEach((done) => {
        let a = 0, b = 0;
        return serve(port, router([
            Path.Route(shorthand("/a/:id/"), dispatcher({
                get: R.cond([
                    [R.compose(R.propEq("id", "a"), R.prop("params")),
                        () => response.response(200, {}, a.toString())],
                    [R.compose(R.propEq("id", "b"), R.prop("params")),
                        () => response.response(200, {}, b.toString())],
                    [R.T, (ctx) => Promise.reject(response.response(404, {}, ctx.params.toString()))]
                ]),
                post: R.cond([
                    [R.compose(R.propEq("id", "a"), R.prop("params")),
                        () => {
                            a = 0;
                            return response.response(200, {}, a.toString());
                        }],
                    [R.compose(R.propEq("id", "b"), R.prop("params")),
                        () => {
                            b = 0;
                            return response.response(200, {}, b.toString());
                        }],
                    [R.T, (ctx) => Promise.reject(response.response(404, {}, ctx.params.toString()))]
                ])
            })),
            Path.Route(shorthand("/a/:id/increment"), dispatcher({
                post: (ctx) => {
                    if (ctx.params.id === "a") {
                        a++;
                        return response.response(200, {}, a.toString());
                    }
                    if (ctx.params.id === "b") {
                        b++;
                        return response.response(200, {}, b.toString());
                    }
                    return response.response(404, {}, null);
                }
            }))
        ]))
        .then((srv) => {
            server = srv;
            done();
        });
    });
    afterEach(() => {
        server.close();
    });
    describe("routing & dispatching", () => {
        it("should handle allowed routes", () =>
            request(`${host}/a/a`)
                .then((res) => expect(res).to.equal("0"))
                .then(() => request(`${host}/a/b`))
                .then((res) => expect(res).to.equal("0"))
                .then(() => request({uri: `${host}/a/b/increment`, method: "post"}))
                .then(() => request({uri: `${host}/a/b/increment`, method: "post"}))
                .then(() => request({uri: `${host}/a/b/increment`, method: "post"}))
                .then((res) => expect(res).to.equal("3"))
                .then(() => request(`${host}/a/a`))
                .then((res) => expect(res).to.equal("0"))
                .then(() => request(`${host}/a/b`))
                .then((res) => expect(res).to.equal("3"))
        );

        it("should 404 on missed routes", () =>
            request({uri: `${host}/q/a`, resolveWithFullResponse: true})
                .then(() => expect(false).to.equal(true))
                .catch((e) => expect(e.statusCode).to.equal(404))
        );

        it("should 405 on missed verbs", () =>
            request({uri: `${host}/a/a`, method: "delete", resolveWithFullResponse: true})
            .then(() => expect(false).to.equal(true))
            .catch((e) => expect(e.statusCode).to.equal(405))

        );
    });
});
