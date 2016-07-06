/*jslint node:true, es6: true, this: true*/
(function (_, R, requireLocal) {
    "use strict";
    function extensionManager(mach) {
        const XS = new Map();
        return _.assign(mach, {
            extend(...args) {
                R.forEach(function (ex) {
                    XS[ex] = XS[ex] || R.once(ex);
                    XS[ex](mach);
                }, args);
            }
        });
    }

    const mach = R.mergeAll(R.map((e) => R.objOf(e, requireLocal(e)),
        ["version", "Connection", "Header", "Location", "Message"]));
    module.exports = extensionManager(mach);
    mach.extend(require("./extensions/default"));
}(
    require("lodash"),
    require("ramda"),
    require("./core/loading").locally(require)
));
