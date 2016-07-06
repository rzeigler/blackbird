/**
 * A middleware that sets a default character set in the Content-Type
 * header of the response if none is already specified.
 */
const {isNil} = require("ramda");
function charset(app, defaultCharset) {
    defaultCharset = defaultCharset || "utf-8";

    return function (conn) {
        return conn.call(app).then(function () {
            const response = conn.response;

            if (response.contentType && isNil(response.charset)) {
                response.charset = defaultCharset;
            }
        });
    };
}

module.exports = charset;
