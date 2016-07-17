const R = require("ramda");


const context = (request) => {

};

const derivedContext = (baseContext) => {

};

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

const inflateResponse = R.cond([
    [R.is(Buffer), inflateBufferBody],
    [R.is(String), inflateStringBody],
    [R.T, R.identity]
]);

const coerceResponse = R.cond([

]);

module.exports = {
    bufferFromUtf8,
    inflateResponse,
    inflateStringBody,
    inflateBufferBody,
    coerceResponse
};
