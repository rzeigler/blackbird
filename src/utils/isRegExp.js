const R = require("ramda");

function isRegExp(object) {
    return R.is(RegExp, object);
}

module.exports = isRegExp;
