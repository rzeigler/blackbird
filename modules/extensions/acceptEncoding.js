const AcceptEncoding = require("../headers/AcceptEncoding");

module.exports = function (mach) {
    mach.Connection.prototype.acceptsEncoding = function (encoding) {
        return this.request.acceptsEncoding(encoding);
    };

    mach.Message.prototype.acceptsEncoding = function (encoding) {
        if (!this._acceptEncodingHeader) {
            this._acceptEncodingHeader = new AcceptEncoding(this.headers["Accept-Encoding"]);
        }

        return this._acceptEncodingHeader.accepts(encoding);
    };
};
