/*jslint node: true, es6: true*/
module.exports = (function (middleware) {
    "use strict";
    return (BB) => {
        Object.assign(BB, middleware);
    };
}(
    require("../middleware")
));
