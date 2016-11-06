const R = require("ramda");
const P = require("parsimmon");
const {array, string, enumerable} = require("../data");
const {parseWith} = require("../parser");

const groupByName = R.groupBy(R.head);
const selectValue = R.map(R.map(enumerable.second));
const mergeDuplicate = R.map(array.join(", "));

// Expects an association list by tuples, i.e. [[k, v], ..., [k, v]]
const canonicalize = R.compose(mergeDuplicate, selectValue, groupByName);

// Not needed when parsing headers because the header parser takes care of
// lowercasing the matched header name during loading
const canonicalizeHeaderNames = (headers) =>
    R.reduce(R.merge, {}, R.map((k) => R.objOf(k.toLowerCase(), headers[k]), R.keys(headers)));

const crlf = P.regex(/\r?\n/);
const colon = P.string(":").skip(P.string(" ").many());
const name = P.regex(/[a-zA-Z-]+/);
const value = P.regex(/[^\r\n]+/);

// Construct a pair of elements
const header = P.of(R.concat)
    .ap(name.map(R.compose(R.of, string.toLowerCase)).skip(colon))
    .ap(value.map(R.of)).skip(crlf);
const headers = P.of(canonicalize).ap(header.many().skip(crlf));

const parseHeaders = parseWith(headers);

module.exports = {
    headers,
    parseHeaders,
    canonicalize,
    canonicalizeHeaderNames
};
