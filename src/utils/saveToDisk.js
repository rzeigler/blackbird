const fs = require("fs");
const File = require("./File");
const Promise = require("./Promise");
const makeTemporaryPath = require("./makeTemporaryPath");
const R = require("ramda");

function saveToDisk(message, filePrefix) {
    return new Promise(function (resolve, reject) {
        const content = message.content;
        const path = makeTemporaryPath(filePrefix);
        const stream = fs.createWriteStream(path);
        let size = 0;

        content.on("error", reject);

        content.on("data", function (chunk) {
            size += chunk.length;
            stream.write(chunk);
        });

        content.on("end", function () {
            stream.end(function () {
                resolve(
          new File({
              path,
              name: message.filename,
              type: message.mediaType,
              size
          })
        );
            });
        });

        if (R.is(Function, content.resume)) {
            content.resume();
        }
    });
}

module.exports = saveToDisk;
