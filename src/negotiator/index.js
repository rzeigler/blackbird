const R = require("ramda");
const Promise = require("bluebird");
const {
    bufferEmitter,
    contextHeadersLens,
    responseHeadersLens,
    responseStatusCodeLens,
    responseBodyLens,
    makeResponse,
    contextConsumeContent
} = require("../core");
const {Left, Right} = require("fantasy-eithers");
const Either = require("fantasy-eithers");
const {array} = require("../data");
const media = require("../media");
const {attemptMediaConstraint, Some} = require("./constraint");

const {
    handlerLens,
    encoderConstraintLens,
    encoderHandlerLens,
    decoderConstraintLens,
    decoderHandlerLens,
    hasDecoder,
    hasNoDecoder,
    hasEncoder,
    hasNoEncoder
} = require("./types");
const {
    malformedRequest,
    malformedContentTypeHeader,
    malformedAcceptHeader,
    unsupportedMediaType,
    notAcceptable
} = require("./errors");

const prio = "q";

// Implementation
const contentTypeLens = R.compose(contextHeadersLens, R.lensProp("content-type"));
const acceptLens = R.compose(contextHeadersLens, R.lensProp("accept"));

const parseAccept = (accept) => {
    if (!accept) {
        return Right(null);
    }
    return media.parser.parseAccept(accept)
        .bimap(R.always(malformedAcceptHeader), R.identity);
};

const parseContentType = (contentType) => {
    if (!contentType) {
        // If no content type then create a filter returning true when the decoder is empty
        return Right(null);
    }
    return media.parser.parseMediaType(contentType)
        .bimap(R.always(malformedContentTypeHeader), R.identity);
};

const filterDecodingResponders = R.curry((contentTypeMedia, responders) => {
    const filter = contentTypeMedia === null ? hasNoDecoder :
        (responder) => hasDecoder(responder) &&
                        attemptMediaConstraint(R.view(decoderConstraintLens, responder), contentTypeMedia)
                            // Some is on the left...
                            .fold(R.T, R.F);
    const useable = R.filter(filter, responders);
    if (useable.length > 0) {
        return Right(useable);
    }
    const noInput = R.filter(hasNoDecoder, responders);
    if (noInput.length > 0) {
        return Right(noInput);
    }
    return Left(unsupportedMediaType);
});

const qParamLens = R.compose(media.parametersLens, R.lensProp(prio));

// Affix the default priority to records without it.
// Normal records get 1, any/* gets 0.02 and */* gets 0.01
const defaultPrio = R.cond([
    [R.compose(R.equals(media.wildcard), R.view(media.typeLens)), R.set(qParamLens, "0.01")],
    [R.compose(R.equals(media.wildcard), R.view(media.subtypeLens)), R.set(qParamLens, "0.02")],
    [R.T, R.set(qParamLens, "1")]
]);

const ensurePrio = R.cond([
    [R.compose(Boolean, R.view(qParamLens)), R.identity],
    [R.T, defaultPrio]
]);

const parsePrio = (media) => {
    const updated = R.over(qParamLens, parseFloat, media);
    const v = R.view(qParamLens, updated);
    return isNaN(v) ? Left(malformedAcceptHeader) : Right(updated);
};

const omitPrio = R.over(media.parametersLens, R.omit([prio]));

// [Media] -> [Media]
const ensureMediaPrios = R.map(ensurePrio);
// [Media] -> Either e [Media] fails if any priorities are not numbers
const parseMediaPrios = R.traverse(Either.of, parsePrio);

const mediaTypeResponderStruct = ([type, responder]) => ({type, responder});
const mediaTypeResponderStructWithConstrainedType = ({type, responder}) => R.merge({type, responder}, {
    // If we have no encoder, then just send back a Some to indicate success using the accept type
    type: hasNoEncoder(responder) ?
        // This some doesn't matter if there is no encoder...
        Some(type) : attemptMediaConstraint(R.view(encoderConstraintLens, responder), type)
});

const isSome = (option) => option.fold(R.T, R.F);

const cartesianStructMediaTypeLens = R.lensProp("type");

const cartesianStructMediaTypeIsSome = R.compose(isSome, R.view(cartesianStructMediaTypeLens));

const extractCartesianStructConstraint = R.over(cartesianStructMediaTypeLens, (o) => o.getOrElse(null));

const cartesianStructHasEncoder = R.compose(hasEncoder, R.prop("responder"));

// Given a set of acceptable media types, return an Either e s where is is a structure
// containing the chosen media type, the result of applying the responders encode constraint to the media if there
// is an encoder, and the responder
const selectEncodingResponder = R.curry((acceptMedias, responders) => {
    // If no accept was sent, check if we have any responders that send no data
    if (!acceptMedias) {
        const empty = R.filter(hasNoEncoder, responders);
        if (empty.length > 0) {
            return Right({
                type: null,
                empty: empty[0]
            });
        }
        // If nothing sends back no data, assume */* as the Accept header
        acceptMedias = [media.wildcardMedia];
    }
    return parseMediaPrios(ensureMediaPrios(acceptMedias))
        .map(R.sortBy(R.view(qParamLens)))
        .map(R.map(omitPrio)) // Remove priorities now that we are sorted
        .chain((normalized) => {
            const constrained = R.map(R.compose(mediaTypeResponderStructWithConstrainedType, mediaTypeResponderStruct),
                                        array.cartesian(normalized, responders));
            const joined = R.filter(cartesianStructMediaTypeIsSome, constrained);
            // All joined.constraints are somes at this point so we can extract
            const remapped = R.map(extractCartesianStructConstraint, joined);
            const [withEncoder, withoutEncoder] = R.partition(cartesianStructHasEncoder, remapped);
            if (withEncoder.length > 0) {
                return Right(R.last(withEncoder));
            }
            if (withoutEncoder.length > 0) {
                return Right(R.last(withoutEncoder));
            }
            return Left(notAcceptable);
        });
});

const runResponder = R.curry((contentTypeMedia, ctx, {type: acceptMedia, responder}) => {
    const handle = R.view(handlerLens, responder);
    const bodyAdd = hasNoDecoder(responder) ?
        Promise.resolve({}) :
        contextConsumeContent(bufferEmitter, ctx)
            .then((buf) => {
                const decode = R.view(decoderHandlerLens, responder);
                const constraint = R.view(decoderConstraintLens, responder);
                // We have already succeeded at this if we reached this point, its just easier to rerun
                const constrainedContentTypeMedia = attemptMediaConstraint(constraint, contentTypeMedia).getOrElse({});
                return decode(R.view(media.parametersLens, constrainedContentTypeMedia), buf)
                    .bimap(malformedRequest, R.objOf("body"))
                    .fold(Promise.reject, Promise.resolve);
            });
    return bodyAdd.then(R.merge(ctx)) // Add the body in
        .then(handle)
        .then((res) => {
            if (!R.view(responseHeadersLens, res) || !R.view(responseStatusCodeLens)) {
                return makeResponse(500, {}, "Handler did not produce a valid response");
            }
            // We have no encoder or no body, so 204 no matter what
            if (hasNoEncoder(responder) || !R.view(responseBodyLens, res)) {
                return makeResponse(204, R.view(responseHeadersLens, res), "");
            }
            const enc = R.view(encoderHandlerLens, responder);
            // We have an encoder, so run it on the responses body
            const encode = R.over(responseBodyLens, enc(R.view(media.parametersLens, acceptMedia)));
            const setContentType = R.over(responseHeadersLens, R.merge({"Content-Type": media.toString(acceptMedia)}));
            const processResponse = R.compose(encode, setContentType);
            return processResponse(res);
        });
});

const negotiator = R.curry((responders, ctx) =>
    parseAccept(R.view(acceptLens, ctx))
            .chain((accept) =>
    parseContentType(R.view(contentTypeLens, ctx))
            .chain((contentType) =>
    filterDecodingResponders(contentType, responders)
            .chain(selectEncodingResponder(accept))
        .map(runResponder(contentType, ctx))))
        .fold(Promise.reject, Promise.resolve)
);

module.exports = R.merge({
    negotiator,
    parsePrio,
    defaultPrio,
    ensurePrio,
    omitPrio,
    parseAccept,
    parseContentType,
    parseMediaPrios,
    filterDecodingResponders,
    selectEncodingResponder,
    codecs: require("./codecs")
}, require("./types"));
