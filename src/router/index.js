const R = require("ramda");
const Promise = require("bluebird");
const {option} = require("../data");
const {message: msg} = require("../core");
const p = require("./path");

const notFound = msg.response(404, {}, "");

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

const isMethod = (method) => R.compose(R.equals(method), R.head);

const dispatcher = R.curry((cors, specs, context) => {
    const method = R.toLower(context.method);
    return option.inhabit(R.find(isMethod(method), specs))
        .map(R.nth(1))
        .map((app) => Promise.resolve(app(context)))
        // Needs cors handling if method is option and no spec found
        .getOrElse(Promise.reject(notFound));
});

module.exports = R.merge({
    router: router(0),
    dispatcher: dispatcher()
}, require("./path"));
