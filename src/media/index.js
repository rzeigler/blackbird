const {merge} = require("ramda");
/**
 * This module defines functions for working with media type representations used by http
 */
module.exports = merge({parser: require("./parser")}, require("./value"));
