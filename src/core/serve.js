const http = require("http");
const https = require("https");
const R = require("ramda");
const Promise = require("bluebird");
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

const handleSendFailure = R.curry((req, _) => {
    console.error(`Sending failed for ${req.socket.address()}`);
});

const requestHandler = R.curry((app, req, res) => {
    req.setTimeout(2000);
    res.setTimeout(2000);
    R.tryCatch(R.compose(Promise.resolve, app), Promise.reject)(message.context(req))
        .then(message.inflateResponse)
        .catch(message.responseFromError)
        .then(message.conditionResponse)
        .then(send(res))
        .catch(handleSendFailure);
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
    nodeServer.on("request", requestHandler(app));
    if (opts.path) {
        nodeServer.listen(opts.path);
    } else {
        nodeServer.listen(opts.port, opts.hostname);
    }
    return nodeServer;
});

module.exports = {serve};
