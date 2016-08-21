const R = require("ramda");
const Option = require("fantasy-options");
const {Some, None} = Option;

module.exports = {
    inhabit: R.cond([
        [R.is(Option), R.identity],
        [R.T, (v) => v ? Some(v) : None]
    ])
};
