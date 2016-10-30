const {curry, identity, always} = require("ramda");
const Either = require("fantasy-eithers");
const {Some, None} = require("fantasy-options");

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
const toOption = (e) => e.fold(always(None), Some);

module.exports = {
    left,
    right,
    inhabitOneOf,
    attempt,
    leftMap,
    toOption
};
