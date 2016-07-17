const http = require("http");
const https = require("https");
const R = require("ramda");

const requestHandler = R.curry((app, req, res) => {

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
