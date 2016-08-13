const Promise = require("bluebird");

// A form of R.always that allows the rejection of bluebird promises without triggering the bluebird unhandled rejection
// warning during construction
module.exports = {alwaysReject: (err) => () => Promise.reject(err)};
