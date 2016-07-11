const {curry} = require("ramda");
const Either = require("fantasy-eithers");

const left = Either.Left;
const right = Either.Right;
const inhabitOneOf = curry((l, r) => r ? right(r) : left(l));

module.exports = {
    left,
    right,
    inhabitOneOf
};
