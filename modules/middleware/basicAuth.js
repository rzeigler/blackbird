module.exports = (function (BB, Promise, R) {
    "use strict";
    BB.extend(require("../extensions/server"));
    function basicAuth(app, options) {
        if (R.is(Function, options)) {
            options = {validate: options};
        }
        const realm = options.realm || "Authorization Required";
        return function (conn) {
            if (conn.remoteUser) {
                return conn.run(app); // Don't overwrite existing remoteUser.
            }

            const [username, password] = conn.auth.split(":", 2);

            return Promise.resolve(options.validate(username, password)).then(function (user) {
                if (user) {
                    conn.remoteUser = user === true ? username : user;
                    return conn.run(app);
                }

                conn.response.headers["WWW-Authenticate"] = `Basic realm="${realm}"`;
                conn.text(401, "Not Authorized");
            });
        };
    }
    return basicAuth;
}(
    require("../index"),
    require("bluebird"),
    require("ramda")
));
