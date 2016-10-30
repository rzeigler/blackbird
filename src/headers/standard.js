/**
 * A set of lenses for standard headers
 */
const R = require("ramda");

module.exports = {
    contentLengthLens: R.lensProp("content-length"),
    contentTypeLens: R.lensProp("content-type"),
    acceptLens: R.lensProp("accept")
};
