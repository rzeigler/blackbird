const http = require("http");
const https = require("https");
const R = require("ramda");
const message = require("./message");

const send = R.curry((res, response) => {
    const body = message.bodyView(response);
    res.writeHead(message.statusCodeView(response), message.headersView(response));
    res.write(body);
    return new Promise(R.invoker("end", res));
});

const requestHandler = R.curry((app, req, res) => {
    R.tryCatch(app, Promise.reject, message.context(req))
        .catch(R.identity)
        .then(message.coerceResponse)
        .then(message.conditionResponse)
        .then(send(res))
        .catch(console.error.bind(console));
});

const serve = R.curry((options, app) => {
    options = options || {};

    if (typeof options === "number") {
        options = {port: options};
    } else if (typeof options === "string") {
        options = {socket: options};
    }

    const nodeServer = options.key && options.cert ?
        https.createServer({key: options.key, cert: options.cert}) :
        http.createServer();
    nodeServer.on("request", requestHandler(app));
    return nodeServer;
});

module.exports = {serve};
