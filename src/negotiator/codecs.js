const R = require("ramda");
const {media} = require("../media");
const {encoder, decoder} = require("./types");
const {Left, Right} = require("fantasy-eithers");
const {malformedRequest, notAcceptable} = require("./errors");

const plainMedia = media("text", "plain");
const jsonMedia = media("application", "json");

const jsonDecoderImpl = R.curry((params, buf) => {
    try {
        return Right(JSON.parse(buf));
    } catch (e) {
        return Left(e.toString());
    }
});

const jsonEncoderImpl = R.curry((params, body) =>
    Right([jsonMedia({charset: "utf8"}), Buffer.from(JSON.stringify(body), "utf8")]));

const jsonDecoder = decoder(jsonMedia, jsonDecoderImpl);

const jsonEncoder = encoder(jsonMedia, jsonEncoderImpl);

// Verification of structure?
const jsonVndDecoder = (mediaType) => decoder(mediaType, jsonDecoderImpl);

const jsonVndEncoder = (mediaType) => encoder(mediaType, jsonEncoderImpl);

const plainTextDecoderImpl = R.curry((params, body) => {
    const encoding = params.encoding || "utf8";
    try {
        return Right(body.toString(encoding));
    } catch (e) { // toString only fails if the encoding is nonsensical
        return Left(malformedRequest(e.message));
    }
});

const plainTextEncoderImpl = R.curry((params, body) => {
    const encoding = params.encoding || "utf8";
    try {
        return Right([plainMedia({charset: encoding}), Buffer.from(body.toString(), encoding)]);
    } catch (e) {
        // Could not perform that encoding successfully because of a wierd encoding selected
        return Left(notAcceptable);
    }
});

module.exports = {
    jsonDecoder,
    jsonVndDecoder,
    jsonDecoderImpl,
    jsonEncoder,
    jsonEncoderImpl,
    jsonVndEncoder
};
