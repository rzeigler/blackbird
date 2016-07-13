const {curry, identity} = require("ramda");
const Either = require("fantasy-eithers");

const left = Either.Left;
const right = Either.Right;
const inhabitOneOf = curry((l, r) => r ? right(r) : left(l));
const attempt = curry((f, v) => {
    try {
        return new Either.Right(f(v));
    } catch (e) {
        return new Either.Left(e);
    }
});
const leftMap = curry((f, e) => e.bimap(f, identity));

module.exports = {
    left,
    right,
    inhabitOneOf,
    attempt,
    leftMap
};
