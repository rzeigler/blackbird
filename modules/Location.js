let d = require("describe-property");
let mergeQuery = require("./utils/mergeQuery");
let stringifyQuery = require("./utils/stringifyQuery");
let parseQuery = require("./utils/parseQuery");
let parseURL = require("./utils/parseURL");
const R = require("ramda");

/**
 * Standard ports for HTTP protocols.
 */
let STANDARD_PORTS = {
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
let PROPERTY_NAMES = ["protocol", "auth", "hostname", "port", "host", "pathname", "search", "queryString", "query", "path"];

function setProperties(location, properties) {
    let propertyName;
    for (let i = 0, len = PROPERTY_NAMES.length; i < len; ++i) {
        propertyName = PROPERTY_NAMES[i];

        if (properties.hasOwnProperty(propertyName) && propertyName in location) {
            location[propertyName] = properties[propertyName];
        }
    }
}

/**
 * A URL location, analogous to window.location.
 *
 * Options may be any of the following:
 *
 * - protocol
 * - auth
 * - hostname
 * - port
 * - host (overrides hostname and port)
 * - pathname
 * - search
 * - queryString (overrides search)
 * - query (overrides queryString/search)
 * - path (overrides pathname and query/queryString/search)
 *
 * Alternatively, options may be a URL string.
 */
function Location(options) {
    this.properties = {};

    if (typeof options === "string") {
        this.href = options;
    } else if (options) {
        setProperties(this, options);
    }
}

Object.defineProperties(Location.prototype, {

  /**
   * Creates and returns a new Location with the path and query of
   * the given location appended.
   */
    concat: d(function (location) {
        if (!R.is(Location, location)) {
            location = new Location(location);
        }

        let pathname = this.pathname;
        let extraPathname = location.pathname;

        if (extraPathname !== "/") {
            pathname = pathname.replace(/\/*$/, "/") + extraPathname.replace(/^\/*/, "");
        }

        let query = mergeQuery(this.query, location.query);

        return new Location({
            protocol: location.protocol || this.protocol,
            auth: location.auth || this.auth,
            hostname: location.hostname || this.hostname,
            port: location.port || this.port,
            pathname: pathname,
            query: query
        });
    }),

  /**
   * The full URL.
   */
    href: d.gs(function () {
        let auth = this.auth;
        let host = this.host;
        let path = this.path;

        return host ? `${this.protocol}//${(auth ? `${auth}@` : "") + host + path}` : path;
    }, function (value) {
        let parsed = parseURL(value);

        setProperties(this, {
            protocol: parsed.protocol,
            auth: parsed.auth,
            hostname: parsed.hostname,
            port: parsed.port,
            pathname: parsed.pathname,
            search: parsed.search
        });
    }),

  /**
   * The portion of the URL that denotes the protocol, including the
   * trailing colon (e.g. "http:" or "https:").
   */
    protocol: propertyAlias("protocol"),

  /**
   * The username:password used in the URL, if any.
   */
    auth: propertyAlias("auth", ""),

  /**
   * The full name of the host, including the port number when using
   * a non-standard port.
   */
    host: d.gs(function () {
        let protocol = this.protocol;
        let host = this.hostname;
        let port = this.port;

        if (!R.isNil(port) && port !== STANDARD_PORTS[protocol]) {
            host += `:${port}`;
        }

        return host;
    }, function (value) {
        let index;

        if (R.is(String, value) && R.contains(":", value)) {
            index = R.findIndex(R.equals(":"), value);
            this.hostname = value.substring(0, index);
            this.port = value.substring(index + 1);
        } else {
            this.hostname = value;
            this.port = null;
        }
    }),

  /**
   * The name of the host without the port.
   */
    hostname: propertyAlias("hostname"),

  /**
   * The port number as a string.
   */
    port: d.gs(function () {
        return this.properties.port || (this.protocol ? STANDARD_PORTS[this.protocol] : null);
    }, function (value) {
        this.properties.port = value ? String(value) : null;
    }),

  /**
   * The URL path without the query string.
   */
    pathname: propertyAlias("pathname", "/"),

  /**
   * The URL path with query string.
   */
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

  /**
   * The query string, including the preceeding ?.
   */
    search: propertyAlias("search", ""),

  /**
   * The query string of the URL, without the preceeding ?.
   */
    queryString: d.gs(function () {
        return this.search.substring(1);
    }, function (value) {
        this.search = value && `?${value}`;
    }),

  /**
   * An object of data in the query string.
   */
    query: d.gs(function () {
        return parseQuery(this.queryString);
    }, function (value) {
        this.queryString = stringifyQuery(value);
    }),

    toJSON: d(function () {
        return this.href;
    }),

    toString: d(function () {
        return this.href;
    })

});

module.exports = Location;
