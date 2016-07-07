/*jslint node: true, es6: true*/
module.exports = (function (middleware) {
    "use strict";
    return (mach) => {
        Object.assign(mach, middleware);
    };
}(
    require("../middleware")
));
