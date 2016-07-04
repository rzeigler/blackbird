let bodec = require("bodec");
let Promise = require("./Promise");
let MaxLengthExceededError = require("./MaxLengthExceededError");

/**
 * Returns a promise for a buffer of all content in the given stream up to
 * the given maximum length.
 */
function bufferStream(stream, maxLength) {
    maxLength = maxLength || Infinity;

    if (!stream.readable)
        throw new Error("Cannot buffer stream that is not readable");

    return new Promise(function (resolve, reject) {
        let chunks = [];
        let length = 0;

        stream.on("error", reject);

        stream.on("data", function (chunk) {
            length += chunk.length;

            if (length > maxLength) {
                reject(new MaxLengthExceededError(maxLength));
            } else {
                chunks.push(chunk);
            }
        });

        stream.on("end", function () {
            resolve(bodec.join(chunks));
        });

        if (typeof stream.resume === "function")
            stream.resume();
    });
}

module.exports = bufferStream;
