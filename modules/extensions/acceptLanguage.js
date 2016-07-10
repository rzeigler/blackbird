const AcceptLanguage = require("../headers/AcceptLanguage");

module.exports = function (BB) {
    BB.Connection.prototype.acceptsLanguage = function (language) {
        return this.request.acceptsLanguage(language);
    };

    BB.Message.prototype.acceptsLanguage = function (language) {
        if (!this._acceptLanguageHeader) {
            this._acceptLanguageHeader = new AcceptLanguage(this.headers["Accept-Language"]);
        }

        return this._acceptLanguageHeader.accepts(language);
    };
};
