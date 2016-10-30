const R = require("ramda");
const {
    encoder,
    decoder
} = require("./types");
const {
    defineMediaConstraint,
    defineParamConstraint,
    stringCoercion,
    isMember,
    Some
} = require("./constraint");
const {
    Left,
    Right
} = require("fantasy-eithers");
const {malformedRequest} = require("./errors");

const jsonConstraint = defineMediaConstraint("application", "json", [
    defineParamConstraint("charset", stringCoercion, isMember(["utf8"]), Some("utf8"))
], false);

const decodeJson = R.curry((params, buf) => {
    try {
        return Right(JSON.parse(buf.toString(params.charset)));
    } catch (e) {
        return Left(malformedRequest(e.toString()));
    }
});

const jsonDecoder = decoder(jsonConstraint, decodeJson);

const encodeJson = R.curry((params, object) => Buffer.from(JSON.stringify(object), params.charset));

const jsonEncoder = encoder(jsonConstraint, encodeJson);

const plainTextConstraint = defineMediaConstraint("text", "plain", [
    defineParamConstraint("charset", stringCoercion, isMember(["utf8", "ascii"]), Some("utf8"))
], false);

const decodePlainText = R.curry((params, buf) => Right(buf.toString(params.charset)));

const plainTextDecoder = decoder(plainTextConstraint, decodePlainText);

const encodePlainText = R.curry((params, text) => Buffer.from(text, params.charset));

const plainTextEncoder = encoder(plainTextConstraint, encodePlainText);

module.exports = {
    encodeJson,
    jsonEncoder,
    decodeJson,
    jsonDecoder,
    plainTextDecoder,
    plainTextEncoder
};
