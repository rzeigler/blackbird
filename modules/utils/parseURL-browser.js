let ORIGIN_MATCHER = /^(https?:)\/\/(?:([^@]+)@)?([^/:]+)(?::(\d+))?/;

function parseURL(url) {
    let origin = ORIGIN_MATCHER.exec(url) || {};

    let anchor = document.createElement("a");
    anchor.href = url;

    return {
        protocol: origin[1] || null,
        auth: origin[2] || null,
        hostname: origin[3] || null,
        port: origin[4] || null,
        pathname: anchor.pathname,
        search: anchor.search,
        hash: anchor.hash
    };
}

module.exports = parseURL;
