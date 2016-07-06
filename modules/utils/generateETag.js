const fs = require("fs");
const crypto = require("crypto");
const Promise = require("./Promise");

function generateETag(path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, function (error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(`"${crypto.createHash("md5").update(data).digest("hex")}"`);
            }
        });
    });
}

module.exports = generateETag;
