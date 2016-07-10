/*eslint no-confusing-arrow: off*/
const parseContent = require("../multipart/parseContent");

const BOUNDARY = /^multipart\/.*boundary=(?:"([^"]+)"|([^;]+))/im;
const NAME = /\bname="([^"]+)"/i;
const FILENAME = /filename=([^;]*)/i;

const {invoker, prop} = require("ramda"),
    quoteStripper = invoker(2, "replace")(/^"|"$/mg, ""),
    quoteNormalizer = invoker(2, "replace")(/\\"/g, "\""),
    match = invoker(1, "match"),
    second = prop(1),
    {Some: some, None: none} = require("fantasy-options"),
    liftOption = (v) => v ? some(v) : none;

module.exports = function (mach) {
    mach.Message.PARSERS["multipart/form-data"] = function (message, maxLength) {
        const partHandler = message.handlePart.bind(message);
        return message.bufferContent()
            .then((content) => parseContent(content, message.multipartBoundary, maxLength, partHandler));
    };

    Object.defineProperties(mach.Message.prototype, {
        multipartBoundary: {
            get() {
                const m = some(this)
                    .map(prop("contentType"))
                    .map(match(BOUNDARY))
                    .chain(liftOption);

                return m.map(second)
                    .chain(liftOption)
                    .getOrElse(m.map(prop(2))
                                .chain(liftOption)
                                .getOrElse(null));
            }
        },

        name: {
            get() {
                return some(this)
                    .map(prop("headers"))
                    .map(prop("Content-Disposition"))
                    .chain(liftOption)
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
                    .chain(liftOption)
                    .map(match(FILENAME))
                    .chain(liftOption)
                    .map(second)
                    .map(quoteStripper)
                    .map(quoteNormalizer)
                    .map(decodeURIComponent)
                    .map((filename) => filename.substr(filename.lastIndexOf("\\") + 1))
                    .getOrElse(null);
            }
        }
    });
    mach.Message.prototype.handlePart = function (part) {
        return part.filename ? part.bufferContent() : part.stringifyContent();
    };
};
