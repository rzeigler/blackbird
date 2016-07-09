/* eslint no-confusing-arrow: off */
const Connection = require("../Connection");
const Promise = require("bluebird");
const R = require("ramda");

/**
 * Creates a new Connection using the given options and sends
 * the request to the given app. Returns a promise for the connection
 * object when the response is received.
 *
 * Options may be any of the Connection options, plus the following:
 *
 * - binary     By default the response content is buffered and stored
 *              in the responseText property of the connection. Set this
 *              option true to disable this behavior.
 * - maxLength  The maximum length of the response content to accept.
 *              This option has no effect when "binary" is true. By
 *              default there is no maximum length.
 * - encoding   The encoding to use to decode the response body. This
 *              option has no effect when "binary" is true. By default
 *              the encoding is whatever was specified in the Content-Type
 *              header of the response.
 *
 * If a modifier function is provided, it will have a chance to modify
 * the Connection object immediately before the request is made.
 */
const binary = R.lensPath(["binary"]),
    maxLength = R.lensPath(["maxLength"]),
    encoding = R.lensPath(["encoding"]);
module.exports = function callApp(app, options, mod) {
    const c = new Connection(options || {}),
        modifier = mod || R.identity;

    return Promise.resolve(modifier(c))
        .then(function (maybeConn) {
            const conn = R.is(Connection, maybeConn) ? maybeConn : c,
                setResponseText = (content) => {
                    conn.responseText = content;
                    return conn;
                },
                checkBinary = () => R.view(binary, options) ?
                    conn :
                    conn.response
                        .stringifyContent(R.view(maxLength, options), R.view(encoding, options))
                        .then(setResponseText);

            return conn.run(app).then(checkBinary);
        });
};
