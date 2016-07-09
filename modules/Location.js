const d = require("describe-property");
const mergeQuery = require("./utils/mergeQuery");
const stringifyQuery = require("./utils/stringifyQuery");
const parseQuery = require("qs").parse;
const parseURL = require("url").parse;
const R = require("ramda");

/**
 * Standard ports for HTTP protocols.
 */
const STANDARD_PORTS = {
    "http:": "80",
    "https:": "443"
};

function propertyAlias(propertyName, defaultValue) {
    return d.gs(function () {
        return this.properties[propertyName] || (R.isNil(defaultValue) ? null : defaultValue);
    }, function (value) {
        this.properties[propertyName] = value;
    });
}

// Order is important here. Later properties take priority.
const PROPERTY_NAMES = [
    "protocol",
    "auth",
    "hostname",
    "port",
    "host",
    "pathname",
    "search",
    "queryString",
    "query",
    "path"
];

function setProperties(location, properties) {
    R.forEach(function (propertyName) {
        if (properties.hasOwnProperty(propertyName) && propertyName in location) {
            location[propertyName] = properties[propertyName];
        }
    }, PROPERTY_NAMES);
}

function Location(options) {
    this.properties = {};
    const transform = R.is(String, options) ? parseURL : R.identity;
    setProperties(this, transform(options || {}));
}

function hrefGetter() {
    const auth = this.auth;
    const host = this.host;
    const path = this.path;

    return host ? `${this.protocol}//${(auth ? `${auth}@` : "") + host + path}` : path;
}

Object.defineProperties(Location.prototype, {
    concat: d(function (location) {
        if (!R.is(Location, location)) {
            location = new Location(location);
        }

        let pathname = this.pathname;
        const extraPathname = location.pathname;

        if (extraPathname !== "/") {
            pathname = pathname.replace(/\/*$/, "/") + extraPathname.replace(/^\/*/, "");
        }

        const query = mergeQuery(this.query, location.query);

        return new Location({
            protocol: location.protocol || this.protocol,
            auth: location.auth || this.auth,
            hostname: location.hostname || this.hostname,
            port: location.port || this.port,
            pathname,
            query
        });
    }),

    href: d.gs(hrefGetter, function (value) {
        setProperties(this, parseURL(value));
    }),

    protocol: propertyAlias("protocol"),
    auth: propertyAlias("auth", ""),

    host: d.gs(function () {
        const protocol = this.protocol || "";
        const port = this.port;
        const portAddition = !R.isNil(port) && port !== STANDARD_PORTS[protocol] ? `:${port}` : "";
        const host = this.hostname || "";

        return host + portAddition;
    }, function (value) {
        const [hostname, port] = (value || "").split(":");
        this.hostname = hostname;
        this.port = port || null;
    }),

    hostname: propertyAlias("hostname"),

    port: d.gs(function () {
        return this.properties.port || (this.protocol ? STANDARD_PORTS[this.protocol] : null);
    }, function (value) {
        this.properties.port = value ? String(value) : null;
    }),

    pathname: propertyAlias("pathname", "/"),

    path: d.gs(function () {
        return this.pathname + this.search;
    }, function (value) {
        let index;

        if (typeof value === "string" && R.contains("?", value)) {
            index = R.findIndex(R.equals("?"), value);
            this.pathname = value.substring(0, index);
            this.search = value.substring(index);
        } else {
            this.pathname = value;
            this.search = null;
        }
    }),

    search: propertyAlias("search", ""),

    queryString: d.gs(function () {
        return this.search.substring(1);
    }, function (value) {
        this.search = value && `?${value}`;
    }),

    query: d.gs(function () {
        return parseQuery(this.queryString);
    }, function (value) {
        this.queryString = stringifyQuery(value);
    }),

    toJSON: d(hrefGetter),
    toString: d(hrefGetter)

});

module.exports = Location;
