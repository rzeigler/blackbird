module.exports = {
    body: require("./body"),
    env: require("./env"),
    serve: require("./serve").serve,
    context: require("./context"),
    response: require("./response")
};

const R = require("ramda");

module.exports = R.mergeAll([
    require("./body"),
    require("./env"),
    require("./serve"),
    require("./context"),
    require("./response")
]);
