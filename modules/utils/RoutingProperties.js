const d = require("describe-property");

const RoutingMethods = {
    delete: "DELETE",
    get: ["GET", "HEAD"],
    head: "HEAD",
    options: "OPTIONS",
    post: "POST",
    put: "PUT",
    trace: "TRACE"
};

const RoutingProperties = Object.keys(RoutingMethods).reduce(function (memo, method) {
    memo[method] = d(function (pattern, app) {
        return this.route(pattern, RoutingMethods[method], app);
    });

    return memo;
}, {});

module.exports = RoutingProperties;
