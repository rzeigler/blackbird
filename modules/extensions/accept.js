const Accept = require("../headers/Accept");

module.exports = function (mach) {
    mach.Connection.prototype.accepts = function (mediaType) {
        return this.request.accepts(mediaType);
    };

    mach.Message.prototype.accepts = function (mediaType) {
        if (!this._acceptHeader) {
            this._acceptHeader = new Accept(this.headers.Accept);
        }

        return this._acceptHeader.accepts(mediaType);
    };
};
