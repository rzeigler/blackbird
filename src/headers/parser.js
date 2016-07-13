const R = require("ramda");
const P = require("parsimmon");
const {array} = require("../data");
const {parseWith} = require("../parser");

const groupByName = R.groupBy(R.head);
const takeValue = R.drop(1);
const mergeDuplicate = array.join(", ");

// Expects an association list by tuples, i.e. [[k, v], ..., [k, v]]
const canonicalize = R.compose(R.map(mergeDuplicate), R.map(R.chain(takeValue)), groupByName);

const crlf = P.string("\r\n");
const colon = P.string(":").skip(P.string(" ").many());
const name = P.regex(/[a-zA-Z\-]+/);
const value = P.regex(/[^\r\n]+/);

// Construct a pair of elements
const header = P.of(R.concat).ap(name.map(R.of).skip(colon)).ap(value.map(R.of)).skip(crlf);
const headers = P.of(canonicalize).ap(header.many().skip(crlf));

const parseHeaders = parseWith(headers);

module.exports = {
    headers,
    parseHeaders,
    canonicalize
};
