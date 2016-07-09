const bodec = require("bodec");
const Stream = require("bufferedstream");
const bufferStream = require("./utils/bufferStream");
const normalizeHeaderName = require("./utils/normalizeHeaderName");
const parseCookie = require("./utils/parseCookie");
const {parse: parseQuery} = require("qs");
const R = require("ramda");

/**
 * The default content to use for new messages.
 */
const DEFAULT_CONTENT = bodec.fromString("");

/**
 * The default maximum length (in bytes) to use in Message#parseContent.
 */
const DEFAULT_MAX_CONTENT_LENGTH = Math.pow(2, 20); // 1M

const HEADERS_LINE_SEPARATOR = /\r?\n/;
const HEADER_SEPARATOR = ": ";

function defaultParser(message, maxLength) {
    return message.stringifyContent(maxLength);
}

class Message {
    constructor(content, headers) {
        this.headers = headers;
        this.content = content;
    }

    get headers() {
        return this._headers;
    }

    set headers(value) {
        this._headers = {};

        if (typeof value === "string") {
            value.split(HEADERS_LINE_SEPARATOR).forEach(function (line) {
                const index = line.indexOf(HEADER_SEPARATOR);

                if (index === -1) {
                    this.addHeader(line, true);
                } else {
                    this.addHeader(line.substring(0, index), line.substring(index + HEADER_SEPARATOR.length));
                }
            }, this);
        } else if (!R.isNil(value)) {
            for (const headerName in value) {
                if (value.hasOwnProperty(headerName)) {
                    this.addHeader(headerName, value[headerName]);
                }
            }
        }
    }

    getHeader(headerName) {
        return this.headers[normalizeHeaderName(headerName)];
    }

    setHeader(headerName, value) {
        this.headers[normalizeHeaderName(headerName)] = value;
    }

    addHeader(headerName, value) {
        headerName = normalizeHeaderName(headerName);

        const headers = this.headers;
        if (headerName in headers) {
            if (Array.isArray(headers[headerName])) {
                headers[headerName].push(value);
            } else {
                headers[headerName] = [headers[headerName], value];
            }
        } else {
            headers[headerName] = value;
        }
    }

    get cookies() {
        if (!this._cookies) {
            const header = this.headers.Cookie;

            if (header) {
                const cookies = parseCookie(header);

                // From RFC 2109:
                // If multiple cookies satisfy the criteria above, they are ordered in
                // the Cookie header such that those with more specific Path attributes
                // precede those with less specific. Ordering with respect to other
                // attributes (e.g., Domain) is unspecified.
                for (const cookieName in cookies) {
                    if (Array.isArray(cookies[cookieName])) {
                        cookies[cookieName] = cookies[cookieName][0] || "";
                    }
                }

                this._cookies = cookies;
            } else {
                this._cookies = {};
            }
        }

        return this._cookies;
    }

    get contentType() {
        return this.headers["Content-Type"];
    }

    set contentType(value) {
        this.headers["Content-Type"] = value;
    }

    get mediaType() {
        const contentType = this.contentType;
        if (!contentType) {
            return null;
        }
        const match = contentType.match(/^([^;,]+)/);
        return match ? match[1].toLowerCase() : null;
    }

    set mediaType(value) {
        this.contentType = value + (this.charset ? `;charset=${this.charset}` : "");
    }

    get charset() {
        const contentType = this.contentType;
        if (!contentType) {
            return null;
        }
        const match = contentType.match(/\bcharset=([\w-]+)/);
        return match ? match[1] : null;
    }

    set charset(value) {
        this.contentType = this.mediaType + (value ? `;charset=${value}` : "");
    }

    get content() {
        return this._content;
    }

    set content(value) {
        if (R.isNil(value)) {
            value = DEFAULT_CONTENT;
        }

        if (R.is(Stream, value)) {
            this._content = value;
            value.pause();
        } else {
            this._content = new Stream(value);
        }

        Reflect.deleteProperty(this, "_bufferedContent");
    }

    get isBuffered() {
        return !R.isNil(this._bufferedContent);
    }

    bufferContent(maxLength) {
        if (R.isNil(this._bufferedContent)) {
            this._bufferedContent = bufferStream(this.content, maxLength);
        }

        return this._bufferedContent;
    }

    stringifyContent(maxLength, encoding) {
        return this.bufferContent(maxLength).then((chunk) =>
            bodec.toString(chunk, encoding || this.charset)
        );
    }

    parseContent(maxLength) {
        if (this._parsedContent) {
            return this._parsedContent;
        }

        if (!R.is(Number, maxLength)) {
            maxLength = DEFAULT_MAX_CONTENT_LENGTH;
        }

        const parser = Message.PARSERS[this.mediaType] || defaultParser;
        this._parsedContent = parser(this, maxLength);

        return this._parsedContent;
    }
}

Message.PARSERS = {
    "application/json": (message, maxLength) =>
        message.stringifyContent(maxLength).then(JSON.parse),
    "application/x-www-form-urlencoded": (message, maxLength) =>
        message.stringifyContent(maxLength).then(parseQuery)
};

module.exports = Message;
