let fs = require("fs");
let File = require("./File");
let Promise = require("./Promise");
let makeTemporaryPath = require("./makeTemporaryPath");

function saveToDisk(message, filePrefix) {
    return new Promise(function (resolve, reject) {
        let content = message.content;
        let path = makeTemporaryPath(filePrefix);
        let stream = fs.createWriteStream(path);
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
              path: path,
              name: message.filename,
              type: message.mediaType,
              size: size
          })
        );
            });
        });

        if (typeof content.resume === "function")
            content.resume();
    });
}

module.exports = saveToDisk;
