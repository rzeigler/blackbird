const R = require("ramda");
const P = require("parsimmon");
const Either = require("fantasy-eithers");
// A set of general combinators for working with parsimmons parsers
function lexeme(p) {
    return p.skip(P.whitespace.many());
}

const parseWith = R.curry((parser, text) => {
    const result = parser.parse(text);
    return result.status ? new Either.Right(result.value) : new Either.Left(result);
});

module.exports = {
    lexeme,
    parseWith
};
