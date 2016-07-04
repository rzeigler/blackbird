let createRequestHandler = require("./createRequestHandler");

/**
 * Binds the given app to the "request" event of the given node HTTP server
 * so that it is called whenever the server receives a new request. Returns
 * the request handler function.
 */
function bindApp(app, nodeServer) {
    let requestHandler = createRequestHandler(app);
    nodeServer.on("request", requestHandler);
    return requestHandler;
}

module.exports = bindApp;
