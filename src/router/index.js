const R = require("ramda");
const Promise = require("bluebird");
const {option} = require("../data");
const {message: msg} = require("../core");
const p = require("./path");

const notFound = msg.response(404, {}, "");
const methodNotAllowed = msg.response(405, {}, "");

const router = R.curry((index, paths, context) => {
    if (index >= R.length(paths)) {
        return Promise.reject(notFound);
    }
    const path = R.nth(index, paths);
    const result = p.match(path.elems, context.remainingPathSplit || context.pathSplit);
    return result.cata({
        Some: (r) => {
            if (R.length(r.remaining) > 0 && !path.isMount) {
                return router(index + 1, paths, context);
            }
            // Attach unmatched parts to the context for passing along
            const assocRemaining = R.assoc("remainingPathSplit", r.remaining);
            const conditionContext = R.compose(msg.overContextParams(R.merge(r.params)), assocRemaining);
            return Promise.resolve(path.app(conditionContext(context)));
        },
        None: () => router(index + 1, paths, context)
    });
});

const isSpecForMethod = (method) => R.compose(R.equals(method), R.head);
const snd = R.nth(1);

// Also works on response headers
const overHeaders = R.over(msg.headersLens);

// Accepts, allowCredentials, allowOrigin, allowHeaders, exposeHeaders in the request
const dispatcher = R.curry((cors, specs, context) => {
    const method = R.toLower(context.method);
    const runApp = (app) => Promise.resolve(app(context));
    const runMissed = () => Promise.reject(methodNotAllowed);

    return R.map(snd, option.inhabit(R.find(isSpecForMethod(method), specs)))
        .fold(runApp, runMissed);
});

module.exports = {
    router: router(0),
    dispatcher: dispatcher(null),
    path: require("./path")
};
