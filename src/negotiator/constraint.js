const R = require("ramda");
const {typeLens, subtypeLens, parametersLens, wildcard, media} = require("../media");
const {Some, None, of: ofOption} = require("fantasy-options");

// Refactorable for use elsewhere?
const stringCoercion = (value) => Some(value.toString());

const numberCoercion = (value) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        return None;
    }
    return Some(parsed);
};

const isMember = R.curry((set, x) => R.contains(x, set));

const isBoundedWith = R.curry((upper, lower, value) => lower <= value < upper);

const defineParamConstraint = R.curry((name, coercer, constraint, valueIfMissing) => ({
    name,
    coercer,
    constraint,
    valueIfMissing
}));

const defineMediaConstraint = R.curry((type, subtype, paramConstraints, allowUnrecognized) => ({
    type,
    subtype,
    paramConstraints,
    allowUnrecognized
}));

const attemptParamConstraint = R.curry((constraint, parameters) => {
    const value = parameters[constraint.name];
    if (!value) {
        return constraint.valueIfMissing.map(R.objOf(constraint.name));
    }
    return constraint.coercer(value)
        .chain(R.cond([
            [constraint.constraint, Some],
            [R.T, R.always(None)]
        ]))
        // Pack into an parameters for merging
        .map(R.objOf(constraint.name));
});

const attemptMediaConstraint = R.curry((mediaConstraint, mediaType) => {
    // If a wildcard match, just use the default values for everything
    if ((R.view(typeLens, mediaType) === mediaConstraint.type || R.view(typeLens, mediaType) === wildcard) &&
            R.view(subtypeLens, mediaType) === wildcard) {
        // When matching against wildcards, we can only handle the constraint if every parameter has a valueIfMissing,
        // wildcards cannot reasonably set parameters
        return R.traverse(ofOption, R.prop("valueIfMissing"), mediaConstraint.paramConstraints)
            .map(R.reduce(R.merge, {}))
            .map(media(mediaConstraint.type, mediaConstraint.subtype));
    }
    if (R.view(typeLens, mediaType) === mediaConstraint.type &&
            R.view(subtypeLens, mediaType) === mediaConstraint.subtype) {
        const expectedParams = R.map(R.prop("name"), mediaConstraint.paramConstraints);
        const presentParams = R.keys(R.view(parametersLens, mediaType));
        // There are parameters in the media type we don't have constraints for and we won't allow unrecognized so fail
        if (R.difference(presentParams, expectedParams).length > 0 && !mediaConstraint.allowUnrecognized) {
            return None;
        }
        // Otherwise, run attemptParamConstraint for each constraint on the medaType params
        const application = R.traverse(ofOption, R.flip(attemptParamConstraint)(R.view(parametersLens, mediaType)),
                                       mediaConstraint.paramConstraints);
        return application
            .map(R.reduce(R.merge, {}))
            .map(media(mediaConstraint.type, mediaConstraint.subtype));
    }
    return None;
});

module.exports = {
    stringCoercion,
    numberCoercion,
    isMember,
    isBoundedWith,
    attemptMediaConstraint,
    defineMediaConstraint,
    attemptParamConstraint,
    defineParamConstraint,
    Some,
    None
};
