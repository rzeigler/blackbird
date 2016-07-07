const R = require("ramda");
const Option = require("fantasy-options");

// General utility functions
const length = R.prop("length");

// String utility functions
const split = R.invoker(1, "split"); // String#split
const trim = R.invoker(0, "trim"); // String#trim
const join = R.invoker(1, "join"); // Array#join

function guardOption(x) {
    return x ? Option.Some(x) : Option.None;
}

const leftMap = R.curry((f, either) =>
    either.bimap(f, R.identity));

module.exports = {
    length,
    split,
    trim,
    join,
    guardOption,
    leftMap
};
