/*   */
const d = require("describe-property");
const objectAssign = require("object-assign");
const compileRoute = require("../utils/compileRoute");
const isRegExp = require("../utils/isRegExp");
const makeParams = require("../utils/makeParams");
const RoutingProperties = require("../utils/RoutingProperties");

const LEADING_HTTP_METHOD_MATCHER = /^(DELETE|GET|HEAD|OPTIONS|POST|PUT|TRACE)\s+(.+)$/;
const {is, not, isEmpty, compose} = require("ramda"),
    isnt = compose(not, is);
/**
 * A middleware that provides pattern-based routing for URLs, with optional
 * support for restricting matches to a specific request method. Named segments
 * of the URL are added to conn.params and take precedence over all others.
 *
 *   app.use(mach.router, {
 *
 *     'GET /login': function (conn) {
 *       // conn.method == 'GET'
 *       // conn.pathname == '/login'
 *     },
 *
 *     'POST /login': function (conn) {
 *       // conn.method == 'POST'
 *       // conn.pathname == '/login'
 *     },
 *
 *     'DELETE /users/:id': function (conn) {
 *       // conn.method == 'DELETE'
 *       // conn.pathname == '/users/5'
 *       // conn.params == { id: 5 }
 *     }
 *
 *   });
 *
 * This function may also be used outside the context of a middleware stack
 * to create a standalone app. Routes may be given one at a time:
 *
 *   let app = mach.router();
 *
 *   app.get('/login', function (conn) {
 *     // ...
 *   });
 *
 *   app.delete('/users/:id', function (conn) {
 *     // ...
 *   });
 *
 * Or all at once:
 *
 *   let app = mach.router({
 *
 *     'GET /login': function (conn) {
 *       // ...
 *     },
 *
 *     'DELETE /users/:id': function (conn) {
 *       // ...
 *     }
 *
 *   });
 *
 * Note: Routes are always tried in the order they were defined.
 */
function createRouter(app, map) {
  // Allow mach.router(map)
    if (typeof app === "object") {
        map = app;
        app = null;
    }

    const routes = {};

    function router(conn) {
        const method = conn.method;
        const routesToTry = (routes[method] || []).concat(routes.ANY || []);

        let route, match;
        for (let i = 0, len = routesToTry.length; i < len; ++i) {
            route = routesToTry[i];

      // Try to match the route.
            match = route.pattern.exec(conn.pathname);
            if (match) {
                const params = makeParams(route.keys, Reflect.apply(Array.prototype.slice, match, [1]));

                if (conn.params) {
          // Route params take precedence above all others.
                    objectAssign(conn.params, params);
                } else {
                    conn.params = params;
                }

                return conn.run(route.app);
            }
        }

        return conn.run(app);
    }

    Object.defineProperties(router, {

    /**
     * Adds a new route that runs the given app when the pattern matches the
     * path used in the request. If the pattern is a string, it is automatically
     * compiled. The following signatures are supported:
     *
     *   route('/users/:id', app)
     *   route('/users/:id', 'PUT', app)
     *   route('/users/:id', [ 'GET', 'PUT' ], app)
     *   route('GET /users/:id', app)
     */
        route: d(function (pattern, methods, app) {
            if (is(Function, methods)) {
                app = methods;
                methods = null;
            }

            if (isnt(Function, app)) {
                throw new Error("Route needs an app");
            }

            if (is(String, methods)) {
                methods = [methods];
            } else if (!Array.isArray(methods)) {
                methods = [];
            }

            const keys = [];

            if (is(String, pattern)) {
                const match = pattern.match(LEADING_HTTP_METHOD_MATCHER);
                if (match) {
                    methods.push(match[1]);
                    pattern = match[2];
                }

                pattern = compileRoute(pattern, keys);
            }

            if (!isRegExp(pattern)) {
                throw new Error("Route pattern must be a RegExp");
            }

            const route = {pattern, keys, app};

            if (isEmpty(methods)) {
                methods.push("ANY");
            }

            methods.forEach(function (method) {
                const upperMethod = method.toUpperCase();

                if (routes[upperMethod]) {
                    routes[upperMethod].push(route);
                } else {
                    routes[upperMethod] = [route];
                }
            });
        }),

    /**
     * Sets the given app as the default for this router.
     */
        run: d(function (downstreamApp) {
            app = downstreamApp;
        })

    });

  // Allow app.use(mach.router, map)
    if (is(Object, map)) {
        for (const route in map) {
            if (map.hasOwnProperty(route)) {
                router.route(route, map[route]);
            }
        }
    }

    Object.defineProperties(router, RoutingProperties);

    return router;
}

module.exports = createRouter;
