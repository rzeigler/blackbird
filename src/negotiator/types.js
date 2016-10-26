const R = require("ramda");
const daggy = require("daggy");

// Core types
// The decoder function receives the media parameters as well as the raw content and should return an Option T
const Decoder = daggy.tagged("constraint", "decode");
const decoder = R.constructN(2, Decoder);

// The encoder function receives the media parameters as well as the object and should return a buffer
const Encoder = daggy.tagged("constraint", "encode");
const encoder = R.constructN(2, Encoder);

const Responder = daggy.tagged("decoder", "encoder", "handler");

const responder = R.curry((decoder, encoder, handler) => {
    if (decoder && !R.is(Decoder, decoder)) {
        throw new TypeError("first argument must be a decoder");
    }
    if (encoder && !R.is(Encoder, encoder)) {
        throw new TypeError("second argument must be an encoder");
    }
    return Responder(decoder, encoder, handler);
});

const decoderLens = R.lensProp("decoder");
const encoderLens = R.lensProp("encoder");
const handlerLens = R.lensProp("handler");
const constraintLens = R.lensProp("constraint");
const encodeHandlerLens = R.lensProp("encode");
const decodeHandlerLens = R.lensProp("decode");
const decoderConstraintLens = R.compose(decoderLens, constraintLens);
const encoderConstraintLens = R.compose(encoderLens, constraintLens);
const encoderHandlerLens = R.compose(encoderLens, encodeHandlerLens);
const decoderHandlerLens = R.compose(decoderLens, decodeHandlerLens);

const hasNoEncoder = R.compose(R.isNil, R.view(encoderLens));
const hasEncoder = R.compose(R.not, hasNoEncoder);
const hasNoDecoder = R.compose(R.isNil, R.view(decoderLens));
const hasDecoder = R.compose(R.not, hasNoDecoder);

module.exports = {
    decoder,
    encoder,
    responder,
    decoderLens,
    encoderLens,
    handlerLens,
    constraintLens,
    encodeHandlerLens,
    decodeHandlerLens,
    decoderConstraintLens,
    encoderConstraintLens,
    encoderHandlerLens,
    decoderHandlerLens,
    hasNoEncoder,
    hasEncoder,
    hasNoDecoder,
    hasDecoder
};
