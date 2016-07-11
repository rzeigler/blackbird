/* */
const stripQuotes = require("../utils/stripQuotes");
const {is} = require("ramda");
/**
 * A middleware that automatically performs content-based HTTP caching in
 * response to requests that use the If-None-Match and/or If-Modified-Since
 * headers. In order to work effectively, downstream apps must use the ETag
 * and/or Last-Modified headers.
 *
 * Example:
 *
 *   app.use(BB.modified);
 *
 *   // Send Last-Modified and ETag headers with static files.
 *   app.use(BB.file, {
 *     useLastModified: true, // this is the default
 *     useETag: true
 *   });
 */
function modified(app) {
    return function (conn) {
        return conn.run(app).then(function () {
            const request = conn.request, response = conn.response;

            const ifNoneMatch = request.headers["If-None-Match"];
            const etag = response.headers.ETag;

            if (ifNoneMatch && etag && etag === stripQuotes(ifNoneMatch)) {
                conn.status = 304;
                response.content = "";
                return;
            }

            const ifModifiedSince = request.headers["If-Modified-Since"];
            let lastModified = response.headers["Last-Modified"];

            if (ifModifiedSince && lastModified) {
                if (is(String, lastModified)) {
                    lastModified = Date.parse(lastModified);
                }

                if (lastModified <= Date.parse(ifModifiedSince)) {
                    conn.status = 304;
                    response.content = "";
                }
            }
        });
    };
}

module.exports = modified;
