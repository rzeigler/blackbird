/*   */
const fs = require("fs");
const BB = require("../index");
const Promise = require("../utils/Promise");
const getFileStats = require("../utils/getFileStats");
const generateETag = require("../utils/generateETag");
const generateIndex = require("../utils/generateIndex");
const joinPaths = require("../utils/joinPaths");

const {is, contains, converge, or} = require("ramda");

BB.extend(require("../extensions/server"));

/**
 * A middleware for serving files efficiently from the file system according
 * to the path specified in the `pathname` variable.
 *
 * Options may be any of the following:
 *
 * - root               The path to the root directory to serve files from
 * - index              An array of file names to try and serve when the
 *                      request targets a directory (e.g. ["index.html", "index.htm"]).
 *                      May simply be truthy to use ["index.html"]
 * - autoIndex          Set this true to automatically generate an index page
 *                      listing a directory's contents when the request targets
 *                      a directory with no index file
 * - useLastModified    Set this true to include the Last-Modified header
 *                      based on the mtime of the file. Defaults to true
 * - useETag            Set this true to include the ETag header based on
 *                      the MD5 checksum of the file. Defaults to false
 *
 * Alternatively, options may be a file path to the root directory.
 *
 * If a matching file cannot be found, the request is forwarded to the
 * downstream app. Otherwise, the file is streamed through to the response.
 *
 * Examples:
 *
 *   // Use the root directory name directly.
 *   app.use(BB.file, '/public');
 *
 *   // Serve static files out of /public, and automatically
 *   // serve an index.htm from any directory that has one.
 *   app.use(BB.file, {
 *     root: '/public',
 *     index: 'index.htm',
 *     useETag: true
 *   });
 *
 *   // Serve static files out of /public, and automatically
 *   // serve an index.html from any directory that has one.
 *   // Also, automatically generate a directory listing for
 *   // any directory without an index.html file.
 *   app.use(BB.file, {
 *     root: '/public',
 *     index: true,
 *     autoIndex: true
 *   });
 *
 * This function may also be used outside of the context of a middleware
 * stack to create a standalone app.
 *
 *   let app = BB.file('/public');
 *   BB.serve(app);
 */
function file(app, options) {
    if (!is(Function, app)) {
        options = app;
        app = null;
    }

    options = options || {};

  // Allow BB.file(path) and app.use(BB.file, path)
    if (is(String, options)) {
        options = {root: options};
    }

    const root = options.root;
    if (!is(String, root) || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
        throw new Error(`Invalid root directory: ${root}`);
    }

    let index = options.index || [];
    if (index) {
        if (typeof index === "string") {
            index = [index];
        } else if (!Array.isArray(index)) {
            index = ["index.html"];
        }
    }

    const useLastModified = "useLastModified" in options ? Boolean(options.useLastModified) : true;
    const useETag = Boolean(options.useETag);

    function sendFile(conn, path, stats) {
        conn.file({
            path,
            size: stats.size
        });

        if (useLastModified) {
            conn.response.headers["Last-Modified"] = stats.mtime.toUTCString();
        }

        if (useETag) {
            return generateETag(path).then(function (etag) {
                conn.response.headers.ETag = etag;
            });
        }
    }

    return function (conn) {
        if (conn.method !== "GET" && conn.method !== "HEAD") {
            return conn.run(app);
        }

        const pathname = conn.pathname;

    // Reject paths that contain "..".
        if (contains("..", pathname)) {
            return conn.text(403, "Forbidden");
        }

        const path = joinPaths(root, pathname);

        return getFileStats(path).then(function (stats) {
            if (stats && stats.isFile()) {
                return sendFile(conn, path, stats);
            }

            if (!stats || !stats.isDirectory()) {
                return conn.run(app);
            }

      // Try to serve one of the index files.
            const indexPaths = index.map(function (indexPath) {
                return joinPaths(path, indexPath);
            });

            return Promise.all(indexPaths.map(getFileStats)).then(function (stats) {
                for (let i = 0, len = stats.length; i < len; ++i) {
                    if (stats[i]) {
                        return sendFile(conn, indexPaths[i], stats[i]);
                    }
                }

                if (!options.autoIndex) {
                    return conn.run(app);
                }

        // Redirect /images => /images/
                if (!(/\/$/).test(pathname)) {
                    return conn.redirect(`${pathname}/`);
                }

        // Automatically generate and serve an index file.
                return generateIndex(root, pathname, conn.basename).then(function (html) {
                    conn.html(html);
                });
            });
        });
    };
}

module.exports = file;
