/*   */
/**
 * A middleware that "catches" non-Errors that are thrown from the downstream
 * app and returns them instead. This can be useful for breaking out of a
 * nested promise chain, for example.
 *
 * Example:
 *
 *   mach.catch(function (conn) {
 *     throw 200;
 *   });
 */
const {is, curry} = require("ramda");
module.exports = curry(function catchError(app, conn) {
    return conn.run(app).then(null, function (reason) {
        if (is(Error, reason)) {
            throw reason;
        }

        return reason;
    });
});
