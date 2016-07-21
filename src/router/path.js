const R = require("ramda");
const daggy = require("daggy");
const Option = require("fantasy-options");
const {option, number} = require("../data");

const emptySome = new Option.Some({});
const none = Option.None;

// impl is a str -> Option str
const Elem = daggy.tagged("type", "params", "impl");

const lit = (lit) => new Elem("lit", [lit], R.cond([
    [R.equals(lit), R.always(emptySome)],
    [R.T, R.always(none)]
]));

const any = (key) => new Elem("any", [key], R.compose(Option.Some, R.objOf(key)));

// You should use ^...$ for most regexps, unless you intend to do something wierd
const regex = R.curry((coerce, regex, name) => new Elem("regex", [regex], (against) =>
    option.inhabit(regex.exec(against))
        .map(R.compose(R.objOf(name), coerce, R.head))));

const nat = regex(number.parseInt10, /^[0-9]+$/);

const natHex = regex(number.parseInt16, /^[0-9A-Fa-f]+$/);

const result = daggy.tagged("params", "remaining");

const match = R.curry((elems, parts) => {
    if (elems.length > parts.length) {
        return Option.None;
    }
    const results = R.sequence(Option.of, R.zipWith((e, p) => e.impl(p), elems, parts));
    // Composite everything into parameters
    const merged = R.map(R.reduce(R.merge, {}), results);
    // return the remaining
    return R.map((ps) => result(ps, R.drop(elems.length, parts)), merged);
});

const path = (elems, app, isMount) => ({
    elems,
    app,
    isMount: isMount || false
});

module.exports = {
    lit,
    any,
    regex,
    nat,
    natHex,
    match,
    result,
    path
};
