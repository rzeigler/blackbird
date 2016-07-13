const R = require("ramda");
const {either} = require("../data");

const textCodec = R.curry((encoding, buffer) => buffer.toString(encoding));

const jsonDecode = R.curry((parameters, buffer) => either.attempt(R.compose(JSON.parse, textCodec("utf-8")), buffer));
const jsonEncode = R.curry((parameters, body) => JSON.stringify(body));

module.exports = {
    jsonDecode,
    jsonEncode
};
