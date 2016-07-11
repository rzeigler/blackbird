const d = require("describe-property");
const StatusCodes = require("../StatusCodes");

module.exports = function (BB) {
    Object.defineProperties(BB.Connection.prototype, {

    /**
     * The message that corresponds with the response status code.
     */
        statusText: d.gs(function () {
            return `${this.status} ${StatusCodes[this.status]}`;
        })

    });
};
