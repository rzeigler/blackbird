const R = require("ramda");
const daggy = require("daggy");

// Core types
// The decoder function receives the media parameters as well as the raw content and should return an Option T
const Decoder = daggy.tagged("media", "decoder");
const decoder = R.constructN(2, Decoder);

// The encoder function receives the media parameters as well as the object and should return a buffer
const Encoder = daggy.tagged("media", "encoder");
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

const responderDecoder = R.prop("decoder");
const decoderMedia = R.prop("media");
const responderDecoderMedia = R.compose(decoderMedia, responderDecoder);
const responderEncoder = R.prop("encoder");
const encoderMedia = decoderMedia;
const responderEncoderMedia = R.compose(encoderMedia, responderEncoder);
const responderHandler = R.prop("handler");

const propIsNil = R.propSatisfies(R.isNil);

const hasNoEncoder = propIsNil("encoder");
const hasNoDecoder = propIsNil("decoder");

module.exports = {
    decoder,
    encoder,
    responder,
    responderDecoder,
    decoderMedia,
    responderDecoderMedia,
    responderEncoder,
    encoderMedia,
    responderEncoderMedia,
    responderHandler,
    hasNoEncoder,
    hasNoDecoder
};
