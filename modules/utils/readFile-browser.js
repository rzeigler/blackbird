/* jshint -W058 */
let Promise = require("./Promise");

function readFile(file) {
    return new Promise(function (resolve, reject) {
        let reader = new FileReader;

        reader.onerror = reject;
        reader.onload = function () {
            resolve(new Uint8Array(reader.result));
        };

        reader.readAsArrayBuffer(file);
    });
}

module.exports = readFile;
