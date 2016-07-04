let path = require("path");
let TMP_DIR = require("os").tmpDir();

function makeTemporaryPath(prefix) {
    prefix = prefix || "";

    let random = (Math.random() * 0x100000000 + 1).toString(36);
    let now = new Date();
    let date = "" + now.getYear() + now.getMonth() + now.getDate();
    let name = [prefix, date, "-", process.pid, "-", random].join("");

    return path.join(TMP_DIR, name);
}

module.exports = makeTemporaryPath;
