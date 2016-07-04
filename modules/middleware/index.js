/*jslint node: true, es6: true */
module.exports = (function (R, requireLocal) {
    "use strict";
    const middlewares = [
        "basicAuth",
        "catch",
        "charset",
        "contentType",
        "favicon",
        "file",
        "gzip",
        "logger",
        "mapper",
        "methodOverride",
        "modified",
        "params",
        "proxy",
        "rewrite",
        "router",
        "session",
        "stack",
        "token"
    ];
    return R.mergeAll(R.map((e) => R.objOf(e, requireLocal(e)), middlewares));
}(
    require("ramda"),
    require("../core/loading").locally(require)
));
