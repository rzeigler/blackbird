/*eslint no-confusing-arrow: off*/
const parseContent = require("../multipart/parseContent");

const BOUNDARY = /^multipart\/.*boundary=(?:"([^"]+)"|([^;]+))/im;
const NAME = /\bname="([^"]+)"/i;
const FILENAME = /filename=([^;]*)/i;

const {prop} = require("ramda"),
    {replace, match} = require("../data/string"),
    quoteStripper = replace(/^"|"$/mg, ""),
    quoteNormalizer = replace(/\\"/g, "\""),
    {second} = require("../data/enumerable"),
    {Some: some} = require("fantasy-options"),
    {inhabit} = require("../data/option");

module.exports = function (BB) {
    BB.Message.PARSERS["multipart/form-data"] = function (message, maxLength) {
        const partHandler = message.handlePart.bind(message);
        return message.bufferContent()
            .then((content) => parseContent(content, message.multipartBoundary, maxLength, partHandler));
    };

    Object.defineProperties(BB.Message.prototype, {
        multipartBoundary: {
            get() {
                const m = some(this)
                    .map(prop("contentType"))
                    .map(match(BOUNDARY))
                    .chain(inhabit);

                return m.map(second)
                    .chain(inhabit)
                    .getOrElse(m.map(prop(2))
                                .chain(inhabit)
                                .getOrElse(null));
            }
        },

        name: {
            get() {
                return some(this)
                    .map(prop("headers"))
                    .map(prop("Content-Disposition"))
                    .chain(inhabit)
                    .map(match(NAME))
                    .map(second)
                    .getOrElse(some(this)
                                .map(prop("headers"))
                                .map(prop("Content-ID"))
                                .getOrElse(null));
            }
        },

        filename: {
            get() {
                return some(this)
                    .map(prop("headers"))
                    .map(prop("Content-Disposition"))
                    .chain(inhabit)
                    .map(match(FILENAME))
                    .chain(inhabit)
                    .map(second)
                    .map(quoteStripper)
                    .map(quoteNormalizer)
                    .map(decodeURIComponent)
                    .map((filename) => filename.substr(filename.lastIndexOf("\\") + 1))
                    .getOrElse(null);
            }
        }
    });
    BB.Message.prototype.handlePart = function (part) {
        return part.filename ? part.bufferContent() : part.stringifyContent();
    };
};
