// Defines the structure of mimetypes
// A mimetype object contains a type, a subtype and a set of arguments
// Mimetypes may be tested for equality and relaxation which is that a
// parameterized mimetype is a less constrained version of another.
const R = require("ramda");
const util = require("./util");

const wildcard = "*";
const unparameterized = {};

const media = R.curry((type, subtype, params) => ({type, subtype, params}));

// Add a parameter to a media
const parameterizeMedia = R.curry((media, key, value) => R.merge(media, {params: R.objOf(key, value)}));

const type = R.prop("type");
const subtype = R.prop("subtype");
const params = R.prop("params");

const parameterValue = (key) => R.compose(util.guardOption, R.prop(key), params);

const wildcardMedia = media(wildcard, wildcard, unparameterized);



const equivalent = R.equals;
const parameterGeneralizationOf = R.curry((outerParams, innerParams) => {
    const oKeys = R.keys(outerParams);
    const iKeys = R.keys(innerParams);
    // Disjoint key sets
    if (R.intersect(oKeys, iKeys).length < oKeys.length) {
        return false;
    }
    return R.equals(outerParams, R.pick(oKeys, innerParams));
});
// Is outer a relaxation of inner
const generalizationOf = R.curry((outerMedia, innerMedia) =>
    type(outerMedia) === wildcard ||
    type(outerMedia) === type(innerMedia) && subtype(outerMedia) === wildcard ||
    type(outerMedia) === type(innerMedia) && subtype(outerMedia) === subtype(innerMedia) &&
            parameterGeneralizationOf(arguments(outerMedia), arguments(innerMedia)) ||
    equivalent(outerMedia, innerMedia)
);

module.exports = {
    wildcard,
    unparameterized,
    parameterizeMedia,
    parameterValue,
    media,
    wildcardMedia,
    type,
    subtype,
    params,
    equivalent,
    parameterGeneralizationOf,
    generalizationOf
};
