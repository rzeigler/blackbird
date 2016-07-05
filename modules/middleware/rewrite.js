let escapeRegExp = require("../utils/escapeRegExp");
let isRegExp = require("../utils/isRegExp");
const {is} = require("ramda");
/**
 * A middleware that provides URL rewriting behavior similar to Apache's
 * mod_rewrite. The pathname of requests that match the given pattern is
 * overwritten with the replacement using a simple String#replace.
 */
function rewrite(app, pattern, replacement) {
    if (is(String, pattern)) {
        pattern = new RegExp(`^${escapeRegExp(pattern)}$`);
    }

    if (!isRegExp(pattern)) {
        throw new Error("Rewrite pattern must be a RegExp or String");
    }

    replacement = replacement || "";

    return function (conn) {
        let pathname = conn.pathname;

    // Modify the pathname if the pattern matches.
        if (pattern.test(pathname)) {
            conn.location.properties.pathname = conn.basename + pathname.replace(pattern, replacement);
        }

        return conn.call(app);
    };
}

module.exports = rewrite;
