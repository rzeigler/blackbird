/*jslint node:true, es6: true, this: true*/
(function (_, R) {
    "use strict";
    function extensionManager(mach) {
        const XS = new Map();
        return _.assign(mach, {extend: function (...args) {
            R.forEach(function (ex) {
                XS[ex] = XS[ex] || R.once(ex);
                XS[ex](mach);
            }, args);
        }});
    }

    function loadUp(slug) {
        return R.objOf(slug, require(`./${slug}`));
    }

    var mach = R.mergeAll(R.map(loadUp, ["version", "Connection", "Header", "Location", "Message"]));
    module.exports = extensionManager(mach);
    mach.extend(require("./extensions/default"));
}(
    require("lodash"),
    require("ramda")
));
