/*jslint node: true, es6: true*/
module.exports = (function (_, middleware) {
    "use strict";
    return (mach) => { _.assign(mach, middleware); };
}(
    require("lodash"),
    require("../middleware")
));
