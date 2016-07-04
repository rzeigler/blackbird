let d = require("describe-property");
let escapeRegExp = require("../utils/escapeRegExp");

function byMostSpecific(a, b) {
    return (b.path.length - a.path.length) || ((b.host || "").length - (a.host || "").length);
}

/**
 * A middleware that provides host and/or location-based routing. Modifies
 * the `basename` connection variable for all downstream apps such that only
 * the portion relevant for dispatch remains in `pathname`.
 *
 *   app.use(mach.mapper, {
 *
 *     'http://example.com/images': function (conn) {
 *       // The hostname used in the request was example.com, and
 *       // the URL path started with "/images". If the request was
 *       // GET /images/avatar.jpg, then conn.pathname is /avatar.jpg
 *     },
 *
 *     '/images': function (conn) {
 *       // The URL path started with "/images"
 *     }
 *
 *   });
 *
 * This function may also be used outside of the context of a middleware
 * stack to create a standalone app. You can either provide mappings one
 * at a time:
 *
 *   let app = mach.mapper();
 *
 *   app.map('/images', function (conn) {
 *     // ...
 *   });
 *
 * Or all at once:
 *
 *   let app = mach.mapper({
 *
 *     '/images': function (conn) {
 *       // ...
 *     }
 *
 *   });
 *
 * Note: Dispatch is done in such a way that the longest paths are tried first
 * since they are the most specific.
 */
function createMapper(app, map) {
  // Allow mach.mapper(map)
    if (typeof app === "object") {
        map = app;
        app = null;
    }

    let mappings = [];

    function mapper(conn) {
        let hostname = conn.hostname;
        let pathname = conn.pathname;

        let mapping, match, remainingPath;
        for (let i = 0, len = mappings.length; i < len; ++i) {
            mapping = mappings[i];

      // Try to match the hostname.
            if (mapping.hostname && mapping.hostname !== hostname)
                continue;

      // Try to match the path.
            if (!(match = pathname.match(mapping.pattern)))
                continue;

      // Skip if the remaining path doesn't start with a "/".
            remainingPath = match[1];
            if (remainingPath.length > 0 && remainingPath[0] !== "/")
                continue;

            conn.basename += mapping.path;

            return conn.call(mapping.app);
        }

        return conn.call(app);
    }

    Object.defineProperties(mapper, {

    /**
     * Adds a new mapping that runs the given app when the location used in the
     * request matches the given location.
     */
        map: d(function (location, app) {
            let hostname, path;

      // If the location is a fully qualified URL use the host as well.
            let match = location.match(/^https?:\/\/(.*?)(\/.*)/);
            if (match) {
                hostname = match[1].replace(/:\d+$/, ""); // Strip the port.
                path = match[2];
            } else {
                path = location;
            }

            if (path.charAt(0) !== "/")
                throw new Error("Mapping path must start with \"/\", was \"" + path + "\"");

            path = path.replace(/\/$/, "");

            let pattern = new RegExp("^" + escapeRegExp(path).replace(/\/+/g, "/+") + "(.*)");

            mappings.push({
                hostname: hostname,
                path: path,
                pattern: pattern,
                app: app
            });

            mappings.sort(byMostSpecific);
        }),

    /**
     * Sets the given app as the default for this mapper.
     */
        run: d(function (downstreamApp) {
            app = downstreamApp;
        })

    });

  // Allow app.use(mach.mapper, map)
    if (typeof map === "object")
        for (let location in map)
            if (map.hasOwnProperty(location))
                mapper.map(location, map[location]);

    return mapper;
}

module.exports = createMapper;
