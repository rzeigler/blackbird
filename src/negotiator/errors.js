const {response: {response, statusCodes}} = require("../core");

const malformedRequest = response(400, {});
const malformedContentTypeHeader = malformedRequest(`${statusCodes[400]}\nMalformed content-type header`);
const malformedAcceptHeader = malformedRequest(`${statusCodes[400]}\nMalformed accept header}`);
const unsupportedMediaType = response(415, {}, statusCodes[415]);
const notAcceptable = response(406, {}, statusCodes[406]);

module.exports = {
    malformedRequest,
    malformedContentTypeHeader,
    malformedAcceptHeader,
    unsupportedMediaType,
    notAcceptable
};
