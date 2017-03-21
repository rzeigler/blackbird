/*
 * Set of utilities for working with contexts
 */
"use strict";

const {
     ap,
     always,
     compose,
     merge,
     objOf,
     of: ofArray,
     pipe,
     reduce
} = require("ramda");

const {
    prop,
    get,
    invoker
} = require("partial.lenses");

const {stream} = require("kefir");
const {Future} = require("fluture");

const reqHeadersLens = prop("headers");
const reqHttpVersionLens = prop("httpVersion");
const reqUrlLens = prop("url");
const reqMethodLens = prop("method");
const reqUpgradeLens = prop("upgrade");

const makeBodyStream = (req) => stream((emitter) => {
    const onData = (data) => emitter.emit(data);
    const onEnd = () => emitter.end();
    const onError = (e) => emitter.error(e);
    req.on("data", onData);
    req.once("end", onEnd);
    req.once("error", onError);
    return () => {
        req.off("data", onData);
        req.off("end", onEnd);
        req.off("error", onError);
    };
});

const streamFuture = (stream) => Future((reject, resolve) => {
    const subscription = stream.observe({
        value: resolve,
        error: reject
    });
    return () => {
        subscription.unsubscribe();
    };
});

const bufferBodyStream = pipe(
    invoker(1, "diff", (prev, next) => Buffer.concat(prev, next)),
    invoker(0, "last"),
    streamFuture
);

const reqComponents = ap([
    compose(objOf("headers"), get(reqHeadersLens)),
    compose(objOf("httpVersion"), get(reqHttpVersionLens)),
    compose(objOf("url"), get(reqUrlLens)),
    compose(objOf("method"), get(reqMethodLens)),
    compose(objOf("upgrade"), get(reqUpgradeLens)),
    // note: _httpMessage._hasBody is a potentially useful property of a request object if a switch is necessary
    compose(objOf("body"), bufferBodyStream, makeBodyStream),
    always(objOf("extra", {}))
]);

const mkContext = pipe(
     ofArray,
     reqComponents,
     reduce(merge, {})
);

module.exports = {
    reqComponents,
    mkContext
};
