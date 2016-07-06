/* jshint -W058 */
const Stream = require("bufferedstream");
const Promise = require("../utils/Promise");
const readFile = require("../utils/readFile");
const File = require("../utils/File");

function createHeaders(name, filename, type) {
    let header = `Content-Disposition: form-data; name="${name}"`;

    if (filename) {
        header += `; filename="${filename}"`;
    }

    if (type) {
        header += `\r\nContent-Type: ${type}`;
    }

    return `${header} \r\n\r\n`;
}

/**
 * Creates and returns a binary stream of multipart content produced
 * from the given params. Param values may be a string, binary, or File
 * object, or an array of any of those types.
 */
function createContent(params, boundary) {
    const content = new Stream;

  // Use a promise chain to write all fields to the content
  // stream in the same order they appear in params.
    let promise = Promise.resolve();

    function appendContent(name, value) {
        if (value instanceof File) {
            const p = readFile(value);

            promise = promise.then(function () {
                content.write(`--${boundary}\r\n${createHeaders(name, value.name, value.type)}`);

                return p.then(function (chunk) {
                    content.write(chunk);
                    content.write("\r\n");
                });
            });
        } else {
            promise = promise.then(function () {
                content.write(`--${boundary}\r\n${createHeaders(name)}`);
                content.write(value);
                content.write("\r\n");
            });
        }
    }

    let param;
    for (const name in params) {
        if (params.hasOwnProperty(name)) {
            param = params[name];

            if (Array.isArray(param)) {
                for (let i = 0, len = param.length; i < len; ++i) {
                    appendContent(name, param[i]);
                }
            } else {
                appendContent(name, param);
            }
        }
    }

    promise.then(function () {
        content.end(`--${boundary}--\r\n`);
    }, function (error) {
        content.emit("error", error);
    });

    return content;
}

module.exports = createContent;
