const AcceptCharset = require("../headers/AcceptCharset");

module.exports = function (mach) {
    mach.Connection.prototype.acceptsCharset = function (charset) {
        return this.request.acceptsCharset(charset);
    };

    mach.Message.prototype.acceptsCharset = function (charset) {
        if (!this._acceptCharsetHeader) {
            this._acceptCharsetHeader = new AcceptCharset(this.headers["Accept-Charset"]);
        }

        return this._acceptCharsetHeader.accepts(charset);
    };
};
