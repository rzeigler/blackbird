const R = require("ramda");

function ContentStore(request) {
    const consumed = false;

    this.consumeContent = function (f) {
        if (consumed) {
            throw new Error("ContentStore has already been consumed");
        }
        return f(request);
    };
}

const context = R.curry((store, request) => ({
    socket: request.socket,
    httpVersion: request.httpVersion,
    method: request.method,
    url: request.url,
    headers: request.headers,
    content: new ContentStore(request),
    store
}));

const consumeContextBody = R.curry((f, context) => context.content.consumeContent(f));

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

const isConformingResponse = R.allPass([
    R.complement(R.isNil),
    statusCodeIsNumber,
    R.anyPass([headersIsUndefined, headersIsStringMap]),
    R.anyPass([bodyIsUndefined, bodyIsBuffer])
]);

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

const contentType = (str) => ({"content-type": str});
/**
 * Canonical responses contain a Buffer as the body field
 */
const response = R.curry((statusCode, headers, body) => ({statusCode, headers, body}));

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
    context,
    consumeContextBody,
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
