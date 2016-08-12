const R = require("ramda");

module.exports = R.mergeAll([
    require("./combinators"),
    R.objOf("bodyBuffer", require("./body-buffer"))
]);
