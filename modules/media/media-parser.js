// A parser for media types
const R = require("ramda");
const P = require("parsimmon");
const Either = require("fantasy-eithers");

const {array, either} = require("./utilities");
const media = require("./media");

const concatStrs = array.join("");

// Parser
function lexeme(p) {
    return p.skip(P.whitespace.many());
}

// Tokens
const text = P.string("text");
const audio = P.string("audio");
const video = P.string("video");
const image = P.string("image");
const application = P.string("application");
const example = P.string("example");
const message = P.string("message");
const model = P.string("model");
const multipart = P.string("multipart");
const type = P.alt(text,
    audio,
    video,
    image,
    application,
    example,
    message,
    model,
    multipart);
const wildcard = P.string("*");
const slash = P.string("/");
const comma = P.string(",");
const semicolon = P.string(";");
const plus = P.string("+");
const period = P.string(".");
const eq = P.string("=");
const untilDelimeter = P.regex(/[^;, ]+/); // Allow matching parameter values.

// Recognizers
const name = P.regex(/[a-zA-Z0-9\-_]+/);
const suffix = P.seq(plus, name).map(concatStrs);
// A subtype is a sequence of names separated by periods followed by an optional suffix
const subtype = P.seq(P.sepBy1(name, period).map(array.join(".")),
                    suffix.atMost(1)
                    .map(R.cond([
                        [R.compose(R.equals(0), array.length), R.always("")],
                        [R.always(true), R.head]
                    ]))
                ).map(concatStrs);

const parameter = lexeme(semicolon).then(P.of(R.objOf).ap(name.skip(eq)).ap(untilDelimeter));
const parameters = parameter.many().map(R.reduce(R.merge, {}));
const mimeRec = P.of(media.media);
const mediaType = P.alt(mimeRec.ap(wildcard.skip(slash)).ap(wildcard).ap(parameters),
                       mimeRec.ap(type.skip(slash)).ap(wildcard).ap(parameters),
                       mimeRec.ap(type.skip(slash)).ap(subtype).ap(parameters));

const accept = P.sepBy1(mediaType, lexeme(comma));

const parseWith = R.curry((parser, text) => {
    const result = parser.parse(text);
    return result.status ? either.right(result.value) : either.left(result);
});

const parseMediaType = parseWith(mediaType);
const parseAccept = parseWith(accept);

module.exports = {
    mediaType,
    accept,
    parseMediaType,
    parseAccept
};
