const R = require("ramda");

function isRegExp(object) {
    return !R.isNil(object) && Object.prototype.toString.call(object) === "[object RegExp]";
}

module.exports = isRegExp;
