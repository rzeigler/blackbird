const {makeResponse, statusCodes} = require("../core");

const malformedRequest = makeResponse(400, {});
const malformedContentTypeHeader = malformedRequest(`${statusCodes[400]}\nMalformed content-type header`);
const malformedAcceptHeader = malformedRequest(`${statusCodes[400]}\nMalformed accept header}`);
const unsupportedMediaType = makeResponse(415, {}, statusCodes[415]);
const notAcceptable = makeResponse(406, {}, statusCodes[406]);

module.exports = {
    malformedRequest,
    malformedContentTypeHeader,
    malformedAcceptHeader,
    unsupportedMediaType,
    notAcceptable
};
