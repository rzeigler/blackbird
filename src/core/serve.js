const http = require("http");
const https = require("https");
const R = require("ramda");
const Promise = require("bluebird");
const message = require("./message");

const send = R.curry((timeout, res, response) => {
    res.setTimeout(timeout);
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

const handleSendFailure = R.curry((req, _) => {
    console.error(`failed to write response to ${req.socket.address()}`);
});

const defaultContext = message.context({});

const requestHandler = R.curry((opts, app, req, res) => {
    req.setTimeout(opts.requestTimeout);
    R.tryCatch(R.compose(Promise.resolve, app), Promise.reject)(defaultContext(req))
        .then(message.inflateResponse)
        .catch(message.responseFromError)
        .then(message.conditionResponse)
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

    nodeServer.on("request", requestHandler({
        requestTimeout: opts.requestTimeout || 2000,
        responseTimeout: opts.responseTimeout || 2000
    }, app));

    if (opts.path) {
        nodeServer.listen(opts.path);
    } else {
        nodeServer.listen(opts.port, opts.hostname);
    }
    return nodeServer;
});

module.exports = {serve};
