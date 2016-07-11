const http = require("http");
const https = require("https");
const AbortablePromise = require("./AbortablePromise");

function sendRequest(conn, location) {
    const transport = location.protocol === "https:" ? https : http;

    return new AbortablePromise(function (resolve, reject, onAbort) {
        const nodeRequest = transport.request({
            method: conn.method,
            protocol: location.protocol,
            auth: location.auth,
            hostname: location.hostname,
            port: location.port,
            path: location.path,
            headers: conn.request.headers
        });

        nodeRequest.on("response", function (nodeResponse) {
            conn.status = nodeResponse.statusCode;
            conn.response.headers = nodeResponse.headers;
            conn.response.content = nodeResponse;
            resolve(conn);
        });

        nodeRequest.on("error", reject);

        onAbort(function () {
            nodeRequest.abort();
            resolve();
        });

        conn.request.content.pipe(nodeRequest);
    });
}

module.exports = sendRequest;
