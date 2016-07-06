const Stream = require("bufferedstream");
const MaxLengthExceededError = require("../utils/MaxLengthExceededError");
const resolveProperties = require("../utils/resolveProperties");
const Promise = require("../utils/Promise");
const Parser = require("./Parser");
const R = require("ramda");

function defaultPartHandler(part) {
    return part.parseContent();
}

/**
 * Parses a multipart message and returns a promise for an object of
 * the parts it contains, keyed by the name of that part. The partHandler
 * argument is a function that should be used to resolve the value of
 * a part. It defaults to collecting all the content in a buffer.
 */
function parseContent(content, boundary, maxLength, partHandler) {
    if (typeof maxLength === "function") {
        partHandler = maxLength;
        maxLength = null;
    }

    partHandler = partHandler || defaultPartHandler;
    maxLength = maxLength || Infinity;

    return new Promise(function (resolve, reject) {
        if (!R.is(Stream, content)) {
            content = new Stream(content);
        }

        const parts = {};
        let contentLength = 0;

        const parser = new Parser(boundary, function (part) {
            parts[part.name] = partHandler(part);
        });

        content.on("error", reject);

        content.on("data", function (chunk) {
            const length = chunk.length;
            contentLength += length;

            if (maxLength && contentLength > maxLength) {
                reject(new MaxLengthExceededError(maxLength));
            } else {
                const parsedLength = parser.execute(chunk);

                if (parsedLength !== length) {
                    reject(new Error(`Error parsing multipart body: ${parsedLength} of ${length} bytes parsed`));
                }
            }
        });

        content.on("end", function () {
            try {
                parser.finish();
                resolve(resolveProperties(parts));
            } catch (error) {
                reject(new Error(`Error parsing multipart body: ${error.message}`));
            }
        });

        content.resume();
    });
}

module.exports = parseContent;
