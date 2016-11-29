const R = require("ramda");
const Promise = require("bluebird");
const {option, array} = require("../data");
const {
    makeResponse,
    contextHeadersLens,
    contextParamsLens
} = require("../core");
const p = require("./path");

const notFound = makeResponse(404, {}, "");
const methodNotAllowed = makeResponse(405, {}, "");

const router = R.curry((index, paths, ctx) => {
    if (index >= R.length(paths)) {
        return Promise.reject(notFound);
    }
    const path = R.nth(index, paths);
    const result = p.match(path.elems, ctx.remainingPathSplit || ctx.pathSplit);
    return result.cata({
        Some: (r) => {
            if (R.length(r.remaining) > 0 && path.isRoute()) {
                return router(index + 1, paths, ctx);
            }
            const assocRemaining = R.assoc("remainingPathSplit", r.remaining);
            const conditionContext = R.compose(R.over(contextParamsLens, R.merge(r.params)), assocRemaining);
            return Promise.resolve(path.app(conditionContext(ctx)));
        },
        None: () => router(index + 1, paths, ctx)
    });
});

// Also works on response headers
const overHeaders = R.over(contextHeadersLens);

const joinHeaders = array.join(", ");
const originView = R.view(R.compose(contextHeadersLens, R.lensProp("origin")));
const requestHeadersView = R.view(R.compose(contextHeadersLens, R.lensProp("access-control-request-headers")));

const corsHeaders = R.curry((allowMethods, ctx) => ({
    "Access-Control-Allow-Origin": originView(ctx),
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": requestHeadersView(ctx) || "",
    "Access-Control-Allow-Methods": joinHeaders(allowMethods)
    // Should we send max age as well?
}));

const corsHandler = R.curry((allowMethods, ctx) =>
    Promise.resolve(makeResponse(200, corsHeaders(allowMethods, ctx), null)));

const conditionCorsResponse = R.curry((ctx, rsp) =>
    overHeaders(R.merge(
        R.merge({"Access-Control-Expose-Headers": joinHeaders(R.keys(R.view(contextHeadersLens, rsp)))},
                corsHeaders([R.toLower(ctx.method)], ctx))
    ), rsp));

// Accepts, allowCredentials, allowOrigin, allowHeaders, exposeHeaders in the request
// specs should be a list of the form {verb: app}
const dispatcher = R.curry((cors, apps, ctx) => {
    const method = R.toLower(ctx.method);
    const allowMethods = R.keys(apps);
    const preflightHandler = cors ? {options: corsHandler(allowMethods)} : {};
    // Add cors headers to expose everything if this isn't a preflight
    const runApp = (app) => Promise.resolve(app(ctx))
        .then(cors && method !== "options" ? conditionCorsResponse(ctx) : R.identity);
    const runMissed = () => Promise.reject(methodNotAllowed);
    // If preflight is enabled, add post processing stage that adds cors responses
    return option.inhabit(R.prop(method, R.merge(preflightHandler, apps)))
        .fold(runApp, runMissed);
});

module.exports = {
    router: router(0),
    dispatcher: dispatcher(false),
    corsDispatcher: dispatcher(true),
    path: require("./path")
};
