"use strict";

const {
    allPass,
    compose,
    converge,
    cond,
    curry,
    identity,
    is,
    merge,
    prop,
    or,
    tryCatch,
    T
} = require("ramda");
const {Future} = require("fluture");
const {VError} = require("verror");
const {makeContext} = require("./context");

const isStringOrBuffer = converge(or, [is(String), is(Buffer)]);

const isResponse = allPass([
    compose(Boolean, prop("statusCode")),
    compose(isStringOrBuffer, prop("body"))
]);

const bodyBuffer = cond([
    [is(Buffer), identity],
    [T, Buffer.from]
]);

const send = curry((res, data) => isResponse(data) ? Future((reject, resolve) => {
    try {
        const body = bodyBuffer(data.body);
        res.writeHead(data.statusCode, merge({"Content-Length": body.length.toString()}, data.headers));
        res.write(body);
        res.end();
        resolve("OK");
    } catch (e) {
        reject(new VError(e, "Unable to write response."));
    }
}) : Future((reject) => {
    const rejection = new VError("data to not conform to response specification.\n%s", JSON.stringify(data));
    try {
        const body = Buffer.from("Internal Server Error");
        res.writeHead(500, {"Content-Type": "text/plain", "Content-Length": body.length.toString()});
        res.write(body);
        res.end();
        reject(rejection);
    } catch (e) {
        reject(new VError(rejection, "Unable to write response"));
    }
}));

const compileE = curry((onError, handler) =>
    (req, res) =>
        tryCatch(handler, Future.reject)(makeContext(req))
            .chainRej(Future.of) // Attempt to recover error path response structures
            .chain(send(res))
            .fork(onError, identity)
);

const compile = (handler) => compileE((e) => {
    console.error("unhandled error", e);
}, handler);

module.exports = {
    send,
    compile,
    compileE
};
