const fs = require("fs");
const Promise = require("bluebird");

function readFile(file) {
    return new Promise(function (resolve, reject) {
        fs.readFile(file.path, function (error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

module.exports = readFile;
