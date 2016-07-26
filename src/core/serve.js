const http = require("http");
const https = require("https");
const R = require("ramda");
const Promise = require("bluebird");
const ctx = require("./context");
const rsp = require("./response");

const send = R.curry((timeout, res, response) => {
    res.setTimeout(timeout);
    const body = rsp.bodyView(response);
    return new Promise((resolve, reject) => {
        res.on("close", reject);
        res.on("end", resolve);
        try {
            res.writeHead(rsp.statusCodeView(response), rsp.headersView(response));
            res.write(body);
            res.end();
        } catch (e) { // This is usually the result of an invalid response
            res.writeHead(500, {});
            res.end();
            reject(e);
        }
    });
});

const handleSendFailure = R.curry((req, e) => {
    console.error(`failed to write response to ${req.socket.address()}: ${e}`);
});


const requestHandler = R.curry((opts, app, req, res) => {
    req.setTimeout(opts.requestTimeout);
    R.tryCatch(R.compose(Promise.resolve, app), Promise.reject)(ctx.context(req))
        .catch(rsp.responseFromError)
        .then(rsp.conditionResponse)
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

    if (opts.path) {
        nodeServer.listen(opts.path);
    } else {
        nodeServer.listen(opts.port, opts.hostname);
    }
    return nodeServer;
});

module.exports = {serve};
