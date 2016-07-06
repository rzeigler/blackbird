const Connection = require("../Connection");
const Location = require("../Location");
const R = require("ramda");

/**
 * Standard ports for HTTP protocols.
 */
const STANDARD_PORTS = {
    "http:": "80",
    "https:": "443"
};

function ensureTrailingColon(string) {
    return string[string.length - 1] === ":" ? string : `${string}:`;
}

/**
 * Creates a new Location object that is reverse-proxy aware.
 */
function createLocation(nodeRequest) {
    const headers = nodeRequest.headers;

    let protocol;
    if (process.env.HTTPS === "on" || headers["x-forwarded-ssl"] === "on" || headers["font-end-https"] === "on") {
        protocol = "https:";
    } else if (headers["x-url-scheme"]) {
        protocol = ensureTrailingColon(headers["x-url-scheme"]);
    } else if (headers["x-forwarded-protocol"]) {
        protocol = ensureTrailingColon(headers["x-forwarded-protocol"].split(",")[0]);
    } else if (headers["x-forwarded-proto"]) {
        protocol = ensureTrailingColon(headers["x-forwarded-proto"].split(",")[0]);
    } else {
        protocol = "http:";
    }

    let host;
    if (headers["x-forwarded-host"]) {
        const hosts = headers["x-forwarded-host"].split(/,\s?/);
        host = hosts[hosts.length - 1];
    } else if (headers.host) {
        host = headers.host;
    } else if (process.env.SERVER_NAME) {
        host = process.env.SERVER_NAME;
    }

    const hostParts = host.split(":", 2);
    const hostname = hostParts[0];
    let port = hostParts[1] || headers["x-forwarded-port"];

    if (R.isNil(port)) {
        if (headers["x-forwarded-host"]) {
            port = STANDARD_PORTS[protocol];
        } else if (headers["x-forwarded-proto"]) {
            port = STANDARD_PORTS[headers["x-forwarded-proto"].split(",")[0]];
        }
    }

    const path = nodeRequest.url;

    return new Location({
        protocol,
        hostname,
        port,
        path
    });
}

/**
 * Creates a mach.Connection from the given node.js HTTP request and
 * server (optional) objects. This is a low-level method that is not
 * generally needed by application-level code.
 */
function createConnection(nodeRequest) {
    const conn = new Connection({
        version: nodeRequest.httpVersion,
        method: nodeRequest.method,
        location: createLocation(nodeRequest),
        headers: nodeRequest.headers,
        content: nodeRequest,
        remoteHost: nodeRequest.connection.remoteAddress,
        remotePort: nodeRequest.connection.remotePort
    });

    nodeRequest.on("close", function () {
        conn.onClose();
    });

    return conn;
}

module.exports = createConnection;
