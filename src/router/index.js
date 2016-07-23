const R = require("ramda");
const Promise = require("bluebird");
const {option, array} = require("../data");
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
            if (R.length(r.remaining) > 0 && path.isRoute()) {
                return router(index + 1, paths, context);
            }
            const assocRemaining = R.assoc("remainingPathSplit", r.remaining);
            const conditionContext = R.compose(msg.overContextParams(R.merge(r.params)), assocRemaining);
            return Promise.resolve(path.app(conditionContext(context)));
        },
        None: () => router(index + 1, paths, context)
    });
});

// The method in a spec from dispatcher is the first element of the array
const isSpecForMethod = (method) => R.compose(R.equals(method), R.head);
const snd = R.nth(1);

// Also works on response headers
const overHeaders = R.over(msg.headersLens);

const coerceCorsHeaderList = R.cond([
    [R.is(Array), array.join(", ")],
    [R.T, R.identity]
]);

const corsHandler = ({allowCredentials, allowOrigin, allowHeaders}, allowMethods) => [
    "options",
    R.always(Promise.resolve(msg.response(200, {
        "Access-Control-Allow-Origin": allowOrigin || "*",
        "Access-Control-Allow-Credentials": Boolean(allowCredentials).toString(),
        "Access-Control-Allow-Headers": coerceCorsHeaderList(allowHeaders || []),
        "Access-Control-Allow-Methods": coerceCorsHeaderList(allowMethods)
    }, null)))
];

// Attach Access-Control-Expose-Headers
const corsConditionResponse = R.curry(({exposeHeaders}, response) =>
    overHeaders(R.merge({"Access-Control-Expose-Headers": coerceCorsHeaderList(exposeHeaders || [])}), response));

//
// Accepts, allowCredentials, allowOrigin, allowHeaders, exposeHeaders in the request
// specs should be a list of the form [[verb, app], ..., [verb, app]]
const dispatcher = R.curry((cors, specs, context) => {
    const method = R.toLower(context.method);
    const allowMethods = R.map(R.head, specs);
    const corsSpecs = R.concat(specs, [cors ? corsHandler(cors, allowMethods) : []]);
    const runApp = (app) => Promise.resolve(app(context))
            .then(cors ? corsConditionResponse(cors) : R.identity);
    const runMissed = () => Promise.reject(methodNotAllowed);
    // Get the app to run
    return R.map(snd, option.inhabit(R.find(isSpecForMethod(method), corsSpecs)))
        .fold(runApp, runMissed);
});

module.exports = {
    router: router(0),
    dispatcher: dispatcher(null),
    corsDispatcher: dispatcher,
    path: require("./path")
};
