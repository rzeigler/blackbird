const R = require("ramda");
const {string} = require("../data");
const {parse: urlParse} = require("url");

/**
 * State and atom store for data event emitters. Prevents multiple attempts to consume the body
 */
function Content(request) {
    let consumed = false;

    this.consumeContent = function (f) {
        if (consumed) {
            throw new Error("Content has already been consumed");
        }
        consumed = true;
        return f(request);
    };
}

const isEmptyString = R.compose(R.equals(0), string.length);

const split = R.compose(R.filter(R.complement(isEmptyString)), string.split("/"));

const urlStruct = (url) => {
    const {query, pathname} = urlParse(url, true);
    return {
        query,
        path: pathname,
        pathSplit: split(pathname)
    };
};

/**
 * Value constructor for context objects. Construct a context object with the listed fields from the request and
 * containing a Content object built from the request in the content field
 */
const context = (request) => R.mergeAll([
    R.pick(["socket", "httpVersion", "method", "headers"], request),
    R.compose(R.objOf("content"), R.construct(Content))(request),
    R.compose(urlStruct, R.prop("url"))(request)
]);

const overContextParams = R.over(R.lensProp("params"));

/**
 * Run a continuation for consuming the body on the body
 */
const consumeContextContent = R.curry((f, context) => context.content.consumeContent(f));

const statusCodeLens = R.lensProp("statusCode");
const headersLens = R.lensProp("headers");
const bodyLens = R.lensProp("body");

const inflateBufferBody = (buffer) => ({
    statusCode: 200,
    headers: {"content-type": "application/octet-stream"},
    body: buffer
});

const bufferFromUtf8 = R.compose(R.curry, R.flip, R.nAry(2))(Buffer.from)("utf-8");

const inflateStringBody = (string) => ({
    statusCode: 200,
    headers: {"content-type": "text/plain; charset=utf-8"},
    body: bufferFromUtf8(string)
});

const statusCodeView = R.view(statusCodeLens);
const headersView = R.view(headersLens);
const bodyView = R.view(bodyLens);

const isStringMap = R.allPass([R.is(Object), R.compose(R.all(R.is(String)), R.values)]);
const statusCodeIsNumber = R.compose(R.is(Number), statusCodeView);
const headersIsStringMap = R.compose(isStringMap, headersView);
const headersIsUndefined = R.compose(R.isNil, headersView);
const bodyIsUndefined = R.compose(R.isNil, bodyView);
const bodyIsBuffer = R.compose(R.is(Buffer), bodyView);

/**
 * Determine if an object meets the criteria for a response
 */
const isConformingResponse = R.allPass([
    R.complement(R.isNil),
    statusCodeIsNumber,
    R.anyPass([headersIsUndefined, headersIsStringMap]),
    R.anyPass([bodyIsUndefined, bodyIsBuffer])
]);

/**
 * Coerce certain obvious types to responses
 */
const inflateResponse = R.cond([
    [R.is(Buffer), inflateBufferBody],
    [R.is(String), inflateStringBody],
    [R.T, R.identity]
]);

const attachContentLength = (response) =>
    R.over(headersLens, R.assoc("content-length", Buffer.byteLength(bodyView(response)).toString()))(response);

const conditionContentLength = R.cond([
    [R.complement(bodyIsUndefined), attachContentLength],
    [R.T, R.identity]
]);

/**
 * Ensure that if the body exists then content-length is also set
 */
const conditionResponse = conditionContentLength;

/**
 * Construct a content-type header block
 */
const contentType = R.objOf("content-type");

/**
 * Canonical responses contain a Buffer as the body field
 */
const response = R.curry((statusCode, headers, body) => ({statusCode, headers, body}));

/**
 * Construct a response from an error. If the error is a conforming response, this is R.identity. Otherwise, a 500
 * error with a body of the error.toString() is produced
 */
const responseFromError = R.cond([
    [isConformingResponse, R.identity],
    [R.T, R.compose(response(500, {}), Buffer.from, (e) => e.toString())]
]);

module.exports = {
    bufferFromUtf8,
    inflateStringBody,
    inflateBufferBody,
    isStringMap,
    isConformingResponse,
    inflateResponse,
    conditionResponse,
    conditionContentLength,
    urlStruct,
    context,
    overContextParams,
    consumeContextContent,
    response,
    responseFromError,
    contentType,
    statusCodeLens,
    statusCodeView,
    headersLens,
    headersView,
    bodyLens,
    bodyView
};
