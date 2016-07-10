/* jshint -W058 */
const d = require("describe-property");
const isBinary = require("bodec").isBinary;
const decodeBase64 = require("./utils/decodeBase64");
const encodeBase64 = require("./utils/encodeBase64");
const stringifyQuery = require("./utils/stringifyQuery");
const Promise = require("./utils/Promise");
const Location = require("./Location");
const Message = require("./Message");
const R = require("ramda"),
    {is} = R;

function locationPropertyAlias(name) {
    return d.gs(function () {
        return this.location[name];
    }, function (value) {
        this.location[name] = value;
    });
}

function defaultErrorHandler(error) {
    if (typeof console !== "undefined" && console.error) {
        console.error(error && error.stack || error);
    } else {
        throw error; // Don't silently swallow errors!
    }
}

function defaultCloseHandler() {}

function defaultApp(conn) {
    conn.status = 404;
    conn.response.contentType = "text/plain";
    conn.response.content = `Not found: ${conn.method} ${conn.path}`;
}

class Connection {
    constructor(opts) {
        const options = opts || {};

        let location;
        if (is(String, options)) {
            location = options; // options may be a URL string.
        } else if (options.location || options.url) {
            location = options.location || options.url;
        }

        this.location = location;
        this.version = options.version || "1.1";
        this.method = options.method;

        this.onError = (options.onError || defaultErrorHandler).bind(this);
        this.onClose = (options.onClose || defaultCloseHandler).bind(this);
        this.request = new Message(options.content, options.headers);
        this.response = new Message();

      // Params may be given as an object.
        if (options.params) {
            if (this.method === "GET" || this.method === "HEAD") {
                this.query = options.params;
            } else {
                this.request.contentType = "application/x-www-form-urlencoded";
                this.request.content = stringifyQuery(options.params);
            }
        }

        this.withCredentials = options.withCredentials || false;
        this.remoteHost = options.remoteHost || null;
        this.remoteUser = options.remoteUser || null;
        this.basename = "";

        this.responseText = null;
        this.status = 200;
    }

    get method() {
        return this._method;
    }

    set method(value) {
        this._method = is(String, value) ? value.toUpperCase() : "GET";
    }

    get location() {
        return this._location;
    }

    set location(value) {
        this._location = is(Location, value) ? value : new Location(value);
    }

    get isSSL() {
        return this.protocol === "https:";
    }

    get auth() {
        const header = this.request.headers.Authorization;

        if (header) {
            const parts = header.split(" ", 2);
            const scheme = parts[0];

            if (scheme.toLowerCase() === "basic") {
                return decodeBase64(parts[1]);
            }

            return header;
        }

        return this.location.auth;
    }

    set auth(value) {
        const headers = this.request.headers;

        if (value && typeof value === "string") {
            headers.Authorization = `Basic ${encodeBase64(value)}`;
        } else {
            Reflect.deleteProperty(headers, "Authorization");
        }
    }

    get pathname() {
        return this.location.pathname.replace(this.basename, "") || "/";
    }

    set pathname(value) {
        this.location.pathname = this.basename + value;
    }

    get path() {
        return this.pathname + this.search;
    }

    set path(value) {
        this.location.path = this.basename + value;
    }

    run(a) {
        const app = a || defaultApp;

        const conn = this;

        try {
            return Promise.resolve(app(conn)).then(function (value) {
                if (R.isNil(value)) {
                    return;
                }

                if (is(Number, value)) {
                    conn.status = value;
                } else if (is(String, value) || isBinary(value) || is(Function, value.pipe)) {
                    conn.response.content = value;
                } else {
                    if (!R.isNil(value.headers)) {
                        conn.response.headers = value.headers;
                    }

                    if (!R.isNil(value.content)) {
                        conn.response.content = value.content;
                    }

                    if (!R.isNil(value.status)) {
                        conn.status = value.status;
                    }
                }
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

Object.defineProperties(Connection.prototype, {
    href: locationPropertyAlias("href"),
    protocol: locationPropertyAlias("protocol"),
    host: locationPropertyAlias("host"),
    hostname: locationPropertyAlias("hostname"),
    port: locationPropertyAlias("port"),
    search: locationPropertyAlias("search"),
    queryString: locationPropertyAlias("queryString"),
    query: locationPropertyAlias("query")
});

module.exports = Connection;
