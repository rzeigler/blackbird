"use strict";

const {
    allPass,
    compose,
    converge,
    curry,
    identity,
    is,
    prop,
    or,
    tryCatch
} = require("ramda");
const {Future} = require("fluture");
const {VError} = require("verror");
const {makeContext} = require("./context");

const isStringOrBuffer = converge(or, [is(String), is(Buffer)]);

const isResponse = allPass([
    compose(Boolean, prop("statusCode")),
    compose(isStringOrBuffer, prop("body"))
]);

const send = curry((res, data) => isResponse(data) ? Future((reject, resolve) => {
    try {
        res.writeHead(data.statusCode, data.headers);
        res.write(data.body);
        res.end();
        resolve("OK");
    } catch (e) {
        reject(new VError(e, "Unable to write response."));
    }
}) : Future((reject) => {
    const rejection = new VError("data to not conform to response specification.\n%s", JSON.stringify(data));
    try {
        res.writeHead(500);
        res.write("Internal Server Error");
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
    compile,
    compileE
};
