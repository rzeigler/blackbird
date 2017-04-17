/*
 * Set of utilities for working with contexts
 */
"use strict";

const {
     ap,
     always,
     compose,
     curry,
     invoker,
     map,
     merge,
     objOf,
     of,
     pipe,
     reduce
} = require("ramda");

const {
    prop,
    get,
    set
} = require("partial.lenses");

const {stream} = require("kefir");
const {Future} = require("fluture");

const reqHeadersLens = prop("headers");
const reqHttpVersionLens = prop("httpVersion");
const reqUrlLens = prop("url");
const reqMethodLens = prop("method");
const reqUpgradeLens = prop("upgrade");

const streamEmitter = (req) => stream((emitter) => {
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

const futurizeStream = (stream) => Future((reject, resolve) => {
    const subscription = stream.last().observe({
        value: resolve,
        error: reject
    });
    return () => {
        subscription.unsubscribe();
    };
});

const concatBufferStream = pipe(
    invoker(0, "bufferWhile"),
    map(Buffer.concat)
);

const reqComponents = ap([
    compose(objOf("headers"), get(reqHeadersLens)),
    compose(objOf("httpVersion"), get(reqHttpVersionLens)),
    compose(objOf("url"), get(reqUrlLens)),
    compose(objOf("rawUrl"), get(reqUrlLens)),
    compose(objOf("method"), get(reqMethodLens)),
    compose(objOf("upgrade"), get(reqUpgradeLens)),
    // note: _httpMessage._hasBody is a potentially useful property of a request object if a switch is necessary
    compose(objOf("body"), futurizeStream, concatBufferStream, streamEmitter),
    always(objOf("extra", {}))
]);

const makeContext = pipe(
     of,
     reqComponents,
     reduce(merge, {})
);

const storeExtra = curry((name, value, target) =>
    set(compose(prop("extra"), prop(name)), value, target)
);

module.exports = {
    streamEmitter,
    concatBufferStream,
    futurizeStream,
    makeContext,
    reqComponents,
    storeExtra
};
