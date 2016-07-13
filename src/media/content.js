const R = require("ramda");
const {either} = require("../data");

const jsonDecode = either.attempt(JSON.parse);
const jsonEncode = JSON.stringify;

module.exports = {
    jsonDecode,
    jsonEncode
};
