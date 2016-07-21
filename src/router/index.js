const R = require("ramda");
const Promise = require("bluebird");
const {message: msg} = require("../core");
const p = require("./path");

const router = R.curry((index, paths, context) => {
    if (index >= R.length(paths)) {
        return Promise.resolve(msg.response(404, {}, ""));
    }
    const path = R.nth(index, paths);
    const result = p.match(path.elems, context.unconsumedPathSplit || context.pathSplit);
    return result.cata({
        Some: (r) => {
            if (R.length(r.remaining) > 0 && !path.isMount) {
                return router(index + 1, paths, context);
            }
            // Attach unmatched parts to the context for passing along
            const assocRemaining = R.assoc("unconsumedPathSplit", r.remaining);
            const conditionContext = R.compose(msg.overContextParams(R.merge(r.params)), assocRemaining);
            return path.app(conditionContext);
        },
        None: () => router(index + 1, paths, context)
    });
});

module.exports = R.merge({router: router(0)}, require("./path"));
