let bodec = require("bodec");
let d = require("describe-property");
let Stream = require("bufferedstream");
let bufferStream = require("./utils/bufferStream");
let normalizeHeaderName = require("./utils/normalizeHeaderName");
let parseCookie = require("./utils/parseCookie");
let parseQuery = require("./utils/parseQuery");
const R = require("ramda");

/**
 * The default content to use for new messages.
 */
let DEFAULT_CONTENT = bodec.fromString("");

/**
 * The default maximum length (in bytes) to use in Message#parseContent.
 */
let DEFAULT_MAX_CONTENT_LENGTH = Math.pow(2, 20); // 1M

let HEADERS_LINE_SEPARATOR = /\r?\n/;
let HEADER_SEPARATOR = ": ";

function defaultParser(message, maxLength) {
    return message.stringifyContent(maxLength);
}

/**
 * An HTTP message.
 */
function Message(content, headers) {
    this.headers = headers;
    this.content = content;
}

Object.defineProperties(Message, {

    PARSERS: d({
        enumerable: true,
        value: {
            "application/json": function (message, maxLength) {
                return message.stringifyContent(maxLength).then(JSON.parse);
            },
            "application/x-www-form-urlencoded": function (message, maxLength) {
                return message.stringifyContent(maxLength).then(parseQuery);
            }
        }
    })

});

Object.defineProperties(Message.prototype, {

  /**
   * The headers of this message as { headerName, value }.
   */
    headers: d.gs(function () {
        return this._headers;
    }, function (value) {
        this._headers = {};

        if (typeof value === "string") {
            value.split(HEADERS_LINE_SEPARATOR).forEach(function (line) {
                let index = line.indexOf(HEADER_SEPARATOR);

                if (index === -1) {
                    this.addHeader(line, true);
                } else {
                    this.addHeader(line.substring(0, index), line.substring(index + HEADER_SEPARATOR.length));
                }
            }, this);
        } else if (!R.isNil(value)) {
            for (let headerName in value) {
                if (value.hasOwnProperty(headerName)) {
                    this.addHeader(headerName, value[headerName]);
                }
            }
        }
    }),

  /**
   * Returns the value of the header with the given name.
   */
    getHeader: d(function (headerName) {
        return this.headers[normalizeHeaderName(headerName)];
    }),

  /**
   * Sets the value of the header with the given name.
   */
    setHeader: d(function (headerName, value) {
        this.headers[normalizeHeaderName(headerName)] = value;
    }),

  /**
   * Adds the value to the header with the given name.
   */
    addHeader: d(function (headerName, value) {
        headerName = normalizeHeaderName(headerName);

        let headers = this.headers;
        if (headerName in headers) {
            if (Array.isArray(headers[headerName])) {
                headers[headerName].push(value);
            } else {
                headers[headerName] = [headers[headerName], value];
            }
        } else {
            headers[headerName] = value;
        }
    }),

  /**
   * An object containing cookies in this message, keyed by name.
   */
    cookies: d.gs(function () {
        if (!this._cookies) {
            let header = this.headers["Cookie"];

            if (header) {
                let cookies = parseCookie(header);

        // From RFC 2109:
        // If multiple cookies satisfy the criteria above, they are ordered in
        // the Cookie header such that those with more specific Path attributes
        // precede those with less specific. Ordering with respect to other
        // attributes (e.g., Domain) is unspecified.
                for (let cookieName in cookies) {
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
    }),

  /**
   * Gets/sets the value of the Content-Type header.
   */
    contentType: d.gs(function () {
        return this.headers["Content-Type"];
    }, function (value) {
        this.headers["Content-Type"] = value;
    }),

  /**
   * The media type (type/subtype) portion of the Content-Type header without any
   * media type parameters. e.g. when Content-Type is "text/plain;charset=utf-8",
   * the mediaType is "text/plain".
   *
   * See http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.7
   */
    mediaType: d.gs(function () {
        let contentType = this.contentType, match;
        if (!contentType) { return null; }
        match = contentType.match(/^([^;,]+)/);
        return match ? match[1].toLowerCase() : null;
    }, function (value) {
        this.contentType = value + (this.charset ? `;charset=${this.charset}` : "");
    }),

  /**
   * Returns the character set used to encode the content of this message. e.g.
   * when Content-Type is "text/plain;charset=utf-8", charset is "utf-8".
   *
   * See http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.4
   */
    charset: d.gs(function () {
        let contentType = this.contentType, match;
        if (!contentType) { return null; }
        match = contentType.match(/\bcharset=([\w-]+)/);
        return match ? match[1] : null;
    }, function (value) {
        this.contentType = this.mediaType + (value ? `;charset=${value}` : "");
    }),

  /**
   * The content of this message as a binary stream.
   */
    content: d.gs(function () {
        return this._content;
    }, function (value) {
        if (R.isNil(value)) {
            value = DEFAULT_CONTENT;
        }

        if (value instanceof Stream) {
            this._content = value;
            value.pause();
        } else {
            this._content = new Stream(value);
        }

        delete this._bufferedContent;
    }),

  /**
   * True if the content of this message is buffered, false otherwise.
   */
    isBuffered: d.gs(function () {
        return !R.isNil(this._bufferedContent);
    }),

  /**
   * Returns a binary representation of the content of this message up to
   * the given length. This is useful in applications that need to access the
   * entire message body at once, instead of as a stream.
   *
   * Note: 0 is a valid value for maxLength. It means "no limit".
   */
    bufferContent: d(function (maxLength) {
        if (R.isNil(this._bufferedContent)) {
            this._bufferedContent = bufferStream(this.content, maxLength);
        }

        return this._bufferedContent;
    }),

  /**
   * Returns the content of this message up to the given length as a string
   * with the given encoding.
   *
   * Note: 0 is a valid value for maxLength. It means "no limit".
   */
    stringifyContent: d(function (maxLength, encoding) {
        encoding = encoding || this.charset;

        return this.bufferContent(maxLength).then(function (chunk) {
            return bodec.toString(chunk, encoding);
        });
    }),

  /**
   * Returns a promise for an object of data contained in the content body.
   *
   * The maxLength argument specifies the maximum length (in bytes) that the
   * parser will accept. If the content stream exceeds the maximum length, the
   * promise is rejected with a MaxLengthExceededError. The appropriate response
   * to send to the client in this case is 413 Request Entity Too Large, but
   * many HTTP clients including most web browsers may not understand it.
   *
   * Note: 0 is a valid value for maxLength. It means "no limit".
   */
    parseContent: d(function (maxLength) {
        if (this._parsedContent) {
            return this._parsedContent;
        }

        if (!R.is(Number, maxLength)) {
            maxLength = DEFAULT_MAX_CONTENT_LENGTH;
        }

        let parser = Message.PARSERS[this.mediaType] || defaultParser;
        this._parsedContent = parser(this, maxLength);

        return this._parsedContent;
    })

});

module.exports = Message;
