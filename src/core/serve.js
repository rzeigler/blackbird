const http = require("http");
const https = require("https");
const R = require("ramda");
const {either} = require("../data");
const message = require("./message");

const send = R.curry((res, response) => {
    const body = message.bodyView(response);
    const result = new Promise((resolve, reject) => {
        res.on("close", reject);
        res.on("end", resolve);
    });
    res.writeHead(message.statusCodeView(response), message.headersView(response));
    res.write(body);
    res.end();
    return result;
});

// Stupid es6 promise implementation requires a this for statics...
const resolveP = Promise.resolve.bind(Promise);
const rejectP = Promise.reject.bind(Promise);

const requestHandler = R.curry((app, req, res) => {
    R.tryCatch(R.compose(resolveP, app), rejectP)(message.context(req))
        .catch(message.coerceError) // Generate 500s beyond coerceResponse
        .then(message.coerceResponse)
        .then(message.conditionResponse)
        .then(send(res))
        .catch(() => console.error("Socket closed unexpectedly"));
});

const serve = R.curry((options, app) => {
    if (typeof options === "number") {
        options = {port: options};
    } else if (typeof options === "string") {
        options = {socket: options};
    }

    const nodeServer = options.key && options.cert ?
        https.createServer({key: options.key, cert: options.cert}) :
        http.createServer();
    nodeServer.on("request", requestHandler(app));
    nodeServer.listen(options.port);
    return nodeServer;
});

module.exports = {serve};
