const http = require("http");
const https = require("https");
const R = require("ramda");
const Promise = require("bluebird");
const {context} = require("./context");
const {
    statusCodeView,
    headersView,
    bodyView,
    responseFromError,
    conditionResponse
} = require("./response");

const send = R.curry((timeout, srvRes, appRes) => {
    srvRes.setTimeout(timeout);
    const body = bodyView(appRes);
    return new Promise((resolve, reject) => {
        srvRes.on("close", reject);
        srvRes.on("end", resolve);
        try {
            srvRes.writeHead(statusCodeView(appRes), headersView(appRes));
            srvRes.write(body);
            srvRes.end();
        } catch (e) { // This is usually the result of an invalid appRes
            srvRes.writeHead(500, {});
            srvRes.end();
            reject(e);
        }
    });
});

const handleSendFailure = R.curry((req, e) => {
    console.error(`failed to write response to ${req.socket.address()}: ${e}`);
});


const requestHandler = R.curry((opts, app, req, res) => {
    req.setTimeout(opts.requestTimeout);
    R.tryCatch(R.compose(Promise.resolve, app), Promise.reject)(context(req))
        .catch(responseFromError)
        .then(conditionResponse)
        .then(send(opts.responseTimeout, res))
        .catch(handleSendFailure(req));
});

const serve = R.curry((options, app) => {
    const opts = R.cond([
        [R.is(Number), R.objOf("port")],
        [R.is(String), R.objOf("path")],
        [R.T, R.identity]
    ])(options);

    const nodeServer = options.key && options.cert ?
        https.createServer({key: options.key, cert: options.cert}) :
        http.createServer();

    // Consider these defaults?
    nodeServer.on("request", requestHandler({
        requestTimeout: opts.requestTimeout || 30000,
        responseTimeout: opts.responseTimeout || 30000
    }, app));

    return new Promise((resolve) => {
        nodeServer.once("listening", () => resolve(nodeServer));
        if (opts.path) {
            nodeServer.listen(opts.path);
        } else {
            nodeServer.listen(opts.port, opts.hostname);
        }
    });
});

module.exports = {serve};
