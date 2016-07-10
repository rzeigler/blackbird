const Accept = require("../headers/Accept");

module.exports = function (BB) {
    BB.Connection.prototype.accepts = function (mediaType) {
        return this.request.accepts(mediaType);
    };

    BB.Message.prototype.accepts = function (mediaType) {
        if (!this._acceptHeader) {
            this._acceptHeader = new Accept(this.headers.Accept);
        }

        return this._acceptHeader.accepts(mediaType);
    };
};
