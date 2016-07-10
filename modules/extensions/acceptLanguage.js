const AcceptLanguage = require("../headers/AcceptLanguage");

module.exports = function (mach) {
    mach.Connection.prototype.acceptsLanguage = function (language) {
        return this.request.acceptsLanguage(language);
    };

    mach.Message.prototype.acceptsLanguage = function (language) {
        if (!this._acceptLanguageHeader) {
            this._acceptLanguageHeader = new AcceptLanguage(this.headers["Accept-Language"]);
        }

        return this._acceptLanguageHeader.accepts(language);
    };
};
