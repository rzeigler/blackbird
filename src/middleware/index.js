const R = require("ramda");
const Promise = require("bluebird");

/**
 * Middleware has the shape App -> App where App = Context -> Promise response
 * We can apply a stack of middlewares i.e. [Middleware] by reducing from the right with function application using
 * the base app as the seed
 */
const applyStack = R.curry((stack, app) => R.reduceRight((app, middle) => middle(app), app, stack));

/**
 * Lifts a function of Context -> Promise Context to a middleware function (App -> App). Pre is a processor of contexts,
 * post, error, and after are processors of responses, i.e. Response -> Promise Response. If you need more power
 * implement the middleware contract directly.
 */
const pre = R.curry((handler, app) =>
    (context) => Promise.resolve(handler(context)).then(app));

const post = R.curry((handler, app) =>
    (context) => Promise.resolve(app(context)).then(handler));

const error = R.curry((handler, app) =>
    (context) => Promise.resolve(app(context)).catch(handler));

const after = R.curry((handler, app) =>
    (context) => Promise.resolve(app(context)).then(handler).catch(handler));

module.exports = {
    applyStack,
    pre,
    post,
    error,
    after
};
