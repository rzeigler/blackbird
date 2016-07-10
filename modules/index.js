/*jslint node:true, es6: true, this: true*/
(function (R, requireLocal) {
    function extensionManager(BB) {
        const XS = new Map();
        return Object.assign(BB, {
            extend(...args) {
                R.forEach(function (ex) {
                    XS[ex] = XS[ex] || R.once(ex);
                    XS[ex](BB);
                }, args);
            }
        });
    }

    const BB = R.mergeAll(R.map((e) => R.objOf(e, requireLocal(e)),
        ["version", "Connection", "Header", "Location", "Message"]));
    module.exports = extensionManager(BB);
    BB.extend(require("./extensions/default"));
}(
    require("ramda"),
    require("./core/loading").locally(require)
));
