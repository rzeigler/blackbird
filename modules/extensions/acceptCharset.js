const AcceptCharset = require("../headers/AcceptCharset");

module.exports = function (BB) {
    BB.Connection.prototype.acceptsCharset = function (charset) {
        return this.request.acceptsCharset(charset);
    };

    BB.Message.prototype.acceptsCharset = function (charset) {
        if (!this._acceptCharsetHeader) {
            this._acceptCharsetHeader = new AcceptCharset(this.headers["Accept-Charset"]);
        }

        return this._acceptCharsetHeader.accepts(charset);
    };
};
