/*jslint node: true, es6: true*/
module.exports = (function (R, requireLocal) {
    "use strict";
    return function (BB) {
        const
            extensions = [
                "accept",
                "acceptCharset",
                "acceptEncoding",
                "acceptLanguage",
                "middleware",
                "multipart",
                "proxy",
                "server",
                "statusText"
            ],
            modules = extensions.map(requireLocal);

        BB.extend(...modules);
    };
}(
    require("ramda"),
    require("../core/loading").locally(require)
));
