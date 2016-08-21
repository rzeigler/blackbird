const R = require("ramda");

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

const statusCodeLens = R.lensProp("statusCode");
const headersLens = R.lensProp("headers");
const bodyLens = R.lensProp("body");

const statusCodeView = R.view(statusCodeLens);
const headersView = R.view(headersLens);
const bodyView = R.view(bodyLens);

const isStringMap = R.allPass([R.is(Object), R.compose(R.all(R.is(String)), R.values)]);
const statusCodeIsNumber = R.compose(R.is(Number), statusCodeView);
const headersIsStringMap = R.compose(isStringMap, headersView);
const headersIsUndefined = R.compose(R.isNil, headersView);
const bodyIsUndefined = R.compose(R.isNil, bodyView);
const bodyIsBuffer = R.compose(R.is(Buffer), bodyView);
const bodyIsString = R.compose(R.is(String), bodyView);

/**
 * Determine if an object meets the criteria for a response
 */
const isConformingResponse = R.allPass([
    R.complement(R.isNil),
    statusCodeIsNumber,
    R.anyPass([headersIsUndefined, headersIsStringMap]),
    R.anyPass([bodyIsUndefined, bodyIsBuffer, bodyIsString])
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

const conditionBody = R.cond([
    [bodyIsString, R.compose(
        R.over(headersLens, R.assoc("content-type", "text/plain")),
        R.over(bodyLens, bufferFromUtf8))],
    [R.T, R.identity]
]);

/**
 * Ensure that if the body exists then content-length is also set
 */
const conditionResponse = R.compose(conditionContentLength, conditionBody);

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


const statusCodes = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",                       // RFC 2518, obsoleted by RFC 4918
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",                     // RFC 4918
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Moved Temporarily",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Time-out",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Request Entity Too Large",
    414: "Request-URI Too Large",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",                     // RFC 2324
    422: "Unprocessable Entity",             // RFC 4918
    423: "Locked",                           // RFC 4918
    424: "Failed Dependency",                // RFC 4918
    425: "Unordered Collection",             // RFC 4918
    426: "Upgrade Required",                 // RFC 2817
    428: "Precondition Required",            // RFC 6585
    429: "Too Many Requests",                // RFC 6585
    431: "Request Header Fields Too Large",  // RFC 6585
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",          // RFC 2295
    507: "Insufficient Storage",             // RFC 4918
    509: "Bandwidth Limit Exceeded",
    510: "Not Extended",                     // RFC 2774
    511: "Network Authentication Required"   // RFC 6585
};

module.exports = {
    bufferFromUtf8,
    inflateStringBody,
    inflateBufferBody,
    isStringMap,
    isConformingResponse,
    inflateResponse,
    conditionResponse,
    conditionContentLength,
    response,
    responseFromError,
    contentType,
    statusCodeLens,
    statusCodeView,
    headersLens,
    headersView,
    bodyLens,
    bodyView,
    statusCodes
};
