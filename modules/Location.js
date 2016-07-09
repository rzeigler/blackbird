const mergeQuery = require("./utils/mergeQuery");
const stringifyQuery = require("./utils/stringifyQuery");
const parseQuery = require("qs").parse;
const parseURL = require("url").parse;
const R = require("ramda");

module.exports = class Location {
    static get PROPERTY_NAMES() {
        return [
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
    }
    static get STANDARD_PORTS() {
        return {
            "http:": "80",
            "https:": "443"
        };
    }
    static setProperties(location, properties) {
        R.forEach(function (propertyName) {
            if (properties.hasOwnProperty(propertyName)) {
                location[propertyName] = properties[propertyName];
            }
        }, Location.PROPERTY_NAMES);
    }

    constructor(options) {
        this.properties = {};
        const transform = R.is(String, options) ? parseURL : R.identity;
        Location.setProperties(this, transform(options || {}));
    }

    concat(location) {
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
    }

    get href() {
        const auth = this.auth;
        const host = this.host;
        const path = this.path;

        return host ? `${this.protocol}//${(auth ? `${auth}@` : "") + host + path}` : path;
    }

    set href(value) {
        Location.setProperties(this, parseURL(value));
    }

    get protocol() {
        return this.properties.protocol;
    }

    set protocol(p) {
        this.properties.protocol = p;
    }

    get auth() {
        return this.properties.auth || "";
    }

    set auth(a) {
        this.properties.auth = a;
    }

    get host() {
        const protocol = this.protocol || "";
        const port = this.port;
        const portAddition = !R.isNil(port) && port !== Location.STANDARD_PORTS[protocol] ? `:${port}` : "";
        const host = this.hostname || "";

        return host + portAddition;
    }

    set host(value) {
        const [hostname, port] = (value || "").split(":");
        this.hostname = hostname || null;
        this.port = port || null;
    }

    get hostname() {
        return this.properties.hostname;
    }

    set hostname(h) {
        this.properties.hostname = h;
    }

    get port() {
        return this.properties.port || (this.protocol ? Location.STANDARD_PORTS[this.protocol] : null);
    }

    set port(value) {
        this.properties.port = value ? String(value) : null;
    }

    get pathname() {
        return this.properties.pathname || "/";
    }

    set pathname(p) {
        this.properties.pathname = p;
    }

    get path() {
        return this.pathname + this.search;
    }

    set path(value) {
        let index;

        if (typeof value === "string" && R.contains("?", value)) {
            index = R.findIndex(R.equals("?"), value);
            this.pathname = value.substring(0, index);
            this.search = value.substring(index);
        } else {
            this.pathname = value;
            this.search = null;
        }
    }

    get search() {
        return this.properties.search || "";
    }

    set search(s) {
        this.properties.search = s;
    }

    get queryString() {
        return this.search.substring(1);
    }

    set queryString(value) {
        this.search = value && `?${value}`;
    }

    get query() {
        return parseQuery(this.queryString);
    }

    set query(value) {
        this.queryString = stringifyQuery(value);
    }

    toJSON() {
        return this.href;
    }

    toString() {
        return this.href;
    }
};
