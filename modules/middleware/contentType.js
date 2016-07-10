const {curry} = require("ramda");
module.exports = curry(function contentType(app, defaultType, conn) {
    return conn.run(app).then(function () {
        const headers = conn.response.headers;
        headers["Content-Type"] = headers["Content-Type"] || defaultType || "text/html";
    });
});
