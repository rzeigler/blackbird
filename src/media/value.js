// Defines the structure of mimetypes
// A mimetype object contains a type, a subtype and a set of arguments
// Mimetypes may be tested for equality and relaxation which is that a
// parameterized mimetype is a less constrained version of another.
const R = require("ramda");
const {lens} = require("../data");

const wildcard = "*";
const unparameterized = {};

// data constructor for a media
const media = R.curry((type, subtype, parameters) => ({type, subtype, parameters}));
// The */* media type
const wildcardMedia = media(wildcard, wildcard, unparameterized);

const typeLens = R.lensProp("type");
const subtypeLens = R.lensProp("subtype");
const parametersLens = R.lensProp("parameters");
const parameterLens = (key) => R.compose(parametersLens, lens.assocLens(key));

// Local utilities
const typeView = R.view(typeLens);
const subtypeView = R.view(subtypeLens);
const parametersView = R.view(parametersLens);

const equivalent = R.equals;
const parameterGeneralizationOf = R.curry((outerParams, innerParams) => {
    const oKeys = R.keys(outerParams);
    const iKeys = R.keys(innerParams);
    // Disjoint key sets
    if (R.intersection(oKeys, iKeys).length < oKeys.length) {
        return false;
    }
    return R.equals(outerParams, R.pick(oKeys, innerParams));
});
// Is outer a relaxation of inner
const generalizationOf = R.curry((outerMedia, innerMedia) =>
    typeView(outerMedia) === wildcard ||
    typeView(outerMedia) === typeView(innerMedia) && subtypeView(outerMedia) === wildcard ||
    typeView(outerMedia) === typeView(innerMedia) && subtypeView(outerMedia) === subtypeView(innerMedia) &&
            parameterGeneralizationOf(parametersView(outerMedia), parametersView(innerMedia)) ||
    equivalent(outerMedia, innerMedia)
);

module.exports = Object.assign(media, {
    wildcard,
    unparameterized,
    media,
    wildcardMedia,
    typeLens,
    subtypeLens,
    parametersLens,
    parameterLens,
    equivalent,
    parameterGeneralizationOf,
    generalizationOf
});
