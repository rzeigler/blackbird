const http = require("http");
const https = require("https");
const R = require("ramda");


const fiveHundred = {
    statusCode: 500,
    body: "Internal Server Error"
};

const handleError = R.cond([
    [R.view(statusCodeLens), R.identity],
    [R.T, R.always(fiveHundred)]
]);

const onSendFailure = (err) => {
    // What to do if send is broken?
};

const send = R.curry((res, payload) => {
    res.writeHead(payload.statusCode, res.headers || {});
});

const requestHandler = R.curry((app, req, res) => {
    R.tryCatch(app, Promise.reject(response(fiveHundred)), context(req))
        .catch(handleError)
        .then(send(res))
        .catch(onSendFailure);
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
