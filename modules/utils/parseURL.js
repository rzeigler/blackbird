const urlParse = require("url").parse;

function parseURL(url) {
    const parsed = urlParse(url);

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
