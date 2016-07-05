/* jshint -W058 */
let createConnection = require("./createConnection");
const R = require("ramda");

/**
 * HTTP status codes that don't have entities.
 */
let STATUS_WITHOUT_CONTENT = {
    100: true,
    101: true,
    204: true,
    304: true
};

/**
 * Binds the given app to the "request" event of the given node HTTP server
 * so that it is called whenever the server receives a new request.
 *
 * Returns the request handler function.
 */
function createRequestHandler(app) {
    return function (nodeRequest, nodeResponse) {
        let conn = createConnection(nodeRequest);

        conn.call(app).then(function () {
            let isHead = conn.method === "HEAD";
            let isEmpty = isHead || STATUS_WITHOUT_CONTENT[conn.status] === true;
            let headers = conn.response.headers;
            let content = conn.response.content;

            if (isEmpty && !isHead) {
                headers["Content-Length"] = 0;
            }

            if (!headers.Date) {
                headers.Date = (new Date).toUTCString();
            }

            nodeResponse.writeHead(conn.status, headers);

            if (isEmpty) {
                nodeResponse.end();

                if (R.is(Function, content.destroy)) {
                    content.destroy();
                }
            } else {
                content.pipe(nodeResponse);
            }
        }, function (error) {
            conn.onError(error);
            nodeResponse.writeHead(500, {"Content-Type": "text/plain"});
            nodeResponse.end("Internal Server Error");
        });
    };
}

module.exports = createRequestHandler;
