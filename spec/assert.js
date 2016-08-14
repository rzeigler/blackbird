const R = require("ramda");
const asrt = require("assert");
const {deepStrictEqual, notDeepStrictEqual, strictEqual, notStrictEqual} = asrt;

const holds = R.curry((fn, expected, actual) => fn(actual, expected));

const holdsDetailed = R.curry((fn, string, expected, actual) => fn(actual, expected, string));

const property = R.curry((fn, string, expected, actual) => asrt.ok(fn(expected, actual), string));

const deepEqual = holds(deepStrictEqual);

const deepEqualDetails = holdsDetailed(deepStrictEqual);

const notDeepEqual = holds(notDeepStrictEqual);

const notDeepEqualDetails = holdsDetailed(notDeepStrictEqual);

const equal = holds(strictEqual);

const notEqual = holds(notStrictEqual);

const notCalled = (name) => () => asrt.ok(false, `${name} should not have been called`);

module.exports = {
    deepEqual,
    deepEqualDetails,
    notDeepEqual,
    notDeepEqualDetails,
    equal,
    notEqual,
    property,
    notCalled
};
