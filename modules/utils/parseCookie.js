const {parse: parseQuery} = require("qs");

function parseCookie(cookie) {
    return parseQuery(cookie, {delimiter: /[;,] */});
}

module.exports = parseCookie;
