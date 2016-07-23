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

const Result = daggy.tagged("params", "remaining");

const paramsLens = R.lensProp("params");
const remainingLens = R.lensProp("remaining");

const match = R.curry((elems, parts) => {
    if (elems.length > parts.length) {
        return Option.None;
    }
    const results = R.sequence(Option.of, R.zipWith((e, p) => e.impl(p), elems, parts));
    // Composite everything into parameters
    const merged = R.map(R.reduce(R.merge, {}), results);
    // return the remaining
    return R.map((ps) => Result(ps, R.drop(elems.length, parts)), merged);
});

const Path = daggy.taggedSum({
    Route: ["elems", "app"],
    Tree: ["elems", "app"]
});

Path.prototype.isRoute = function () {
    return this.cata({
        Route: R.always(true),
        Tree: R.always(false)
    });
};

Path.prototype.isTree = function () {
    return this.cata({
        Route: R.always(false),
        Tree: R.always(true)
    });
};

module.exports = {
    lit,
    any,
    regex,
    nat,
    natHex,
    match,
    paramsLens,
    remainingLens,
    Result,
    Path
};
