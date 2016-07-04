let urlParse = require("url").parse;

function parseURL(url) {
    let parsed = urlParse(url);

    return {
        protocol: parsed.protocol,
        auth: parsed.auth,
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash
    };
}

module.exports = parseURL;
