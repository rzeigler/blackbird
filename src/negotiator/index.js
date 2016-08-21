const R = require("ramda");
const Promise = require("bluebird");
const daggy = require("daggy");
const {Left, Right} = require("fantasy-eithers");
const Either = require("fantasy-eithers");
const {context, body, response} = require("../core");
const {array} = require("../data");
const media = require("../media");
const {
    malformedRequest,
    malformedContentTypeHeader,
    malformedAcceptHeader,
    unsupportedMediaType,
    notAcceptable
} = require("./errors");

const prio = "q";

// Core types
// The decoder function receives the media parameters as well as the raw content and should return an Option T
const Decoder = daggy.tagged("media", "decoder");
const decoder = R.constructN(2, Decoder);

// The encoder function receives the media parameters as well as the object and should return a buffer
const Encoder = daggy.tagged("media", "encoder");
const encoder = R.constructN(2, Encoder);

const Responder = daggy.tagged("decoder", "encoder", "handler");

const responder = R.constructN(3, Responder);
const outputResponder = responder(null);

const responderDecoder = R.prop("decoder");
const decoderMedia = R.prop("media");
const responderDecoderMedia = R.compose(decoderMedia, responderDecoder);
const responderEncoder = R.prop("encoder");
const encoderMedia = decoderMedia;
const responderEncoderMedia = R.compose(encoderMedia, responderEncoder);
const responderHandler = R.prop("handler");

// Implementation
const contentTypeLens = R.compose(context.headersLens, R.lensProp("content-type"));
const acceptLens = R.compose(context.headersLens, R.lensProp("accept"));

const propIsNil = R.propSatisfies(R.isNil);

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
    return media.parser.parseContentType(contentType)
        .bimap(R.always(malformedContentTypeHeader), R.identity);
};

const filterDecodingResponders = R.curry((contentTypeMedia, responders) => {
    const filter = contentTypeMedia === null ? propIsNil("decoder") :
        (responder) => responderDecoder(responder) &&
                        media.generalizationOf(responderDecoderMedia(responder), contentTypeMedia);
    const useable = R.filter(filter, responders);
    if (useable.length > 0) {
        return Right(useable);
    }
    const noInput = R.filter(propIsNil("decoder"), responders);
    if (noInput.length > 0) {
        return Right(noInput);
    }
    return Left(unsupportedMediaType);
});

const qParamLens = R.compose(media.parametersLens, R.lensProp(prio));

const ensurePrio = R.cond([
    [R.compose(R.has(prio), R.view(media.parametersLens)), R.identity],
    [R.T, R.set(qParamLens, "1")]
]);

const parsePrio = (media) => {
    const updated = R.over(qParamLens, parseFloat, media);
    const v = R.view(qParamLens, updated);
    return isNaN(v) ? Left(malformedAcceptHeader) : Right(updated);
};

const omitPrio = R.over(media.parametersLens, R.omit([prio]));

const isSuitableMediaEncoderPair = ([mediaType, responder]) =>
    !responderEncoder(responder) || media.generalizationOf(responderEncoderMedia(responder), omitPrio(mediaType));


const selectEncodingResponder = R.curry((acceptMedias, responders) => {
    // If no accept was sent, check if we have any responders that send no data
    if (!acceptMedias) {
        const empty = R.filter(propIsNil("encoder"), responders);
        if (empty.length > 0) {
            return Right(empty[0]);
        }
        // If no responders send no data, fall back to assuming */*
        return Right(responders[0]);
    }
    return R.sequence(Either.of, R.map(R.compose(parsePrio, ensurePrio)(acceptMedias)))
        .map(R.sortBy(R.view(qParamLens)))
        .chain((normalized) => {
            const joined = R.filter(isSuitableMediaEncoderPair, array.cartesian(normalized, responders));
            const [hasEncoder, noEncoder] = R.partition(R.compose(Boolean, responderEncoder, R.tail), joined);
            if (hasEncoder.length > 0) {
                return R.tail(hasEncoder);
            }
            if (noEncoder.length > 0) {
                return R.tail(noEncoder);
            }
            return Left(notAcceptable);
        });
});

const runResponder = R.curry((ctMedia, ctx, [renderMedia, responder]) => {
    const dec = responderDecoder(responder);
    const enc = responderEncoder(responder);
    const handle = responderHandler(responder);
    // Assume selected responder won't have an encoder if it makes it through the selection process
    const bodyAdd = decoder ?
        context.consumeContent(body.buffer, ctx)
            // Run the decoder against the body. Decoders have the form buffer -> Either String a
            .then((buf) => dec.decoder(R.view(media.parametersLens, ctMedia), buf)
                // If an error occured, build a malformed request response
                // otherwise, create an update structure of {"body": a} to apply to the context
                .bimap(malformedRequest, R.objOf("body"))
                // Back to promises
                .fold(Promise.reject, Promise.resolve)) :
        // If no responder decoder, don't send a body update
        Promise.resolve({});
    // Attach body to the context
    return bodyAdd.then(R.merge(ctx))
        // Run the handler
        .then(handle)
        .then((res) => {
            // Nothing came back. Hmmm...
            if (!response.isConformingResponse(res)) {
                return response.response(500, {}, "Handler did not produce a valid response");
            }
            // We have no encoder, so send 204 regardless
            if (!enc) {
                return response.response(204, R.view(response.headersLens, res), "");
            }
            return R.over(response.bodyLens,
                          (body) => enc.encoder(enc.encoder(R.view(media.parametersLens, renderMedia), body)),
                          res);
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

module.exports = {
    negotiator,
    decoder,
    encoder,
    responder,
    outputResponder,
    parsePrio,
    ensurePrio,
    omitPrio,
    parseAccept,
    parseContentType,
    filterDecodingResponders,
    selectEncodingResponder,
    isSuitableMediaEncoderPair
};
