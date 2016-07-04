/*jslint node: true, es6: true*/
module.exports = (function (R, requireLocal) {
    "use strict";
    return function (mach) {
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

        mach.extend(...modules);
    };
}(
    require("ramda"),
    require("../core/loading").locally(require)
));
