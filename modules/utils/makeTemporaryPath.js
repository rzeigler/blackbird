const path = require("path");
const TMP_DIR = require("os").tmpDir();

function makeTemporaryPath(prefix) {
    prefix = prefix || "";

    const random = (Math.random() * 0x100000000 + 1).toString(36);
    const now = new Date();
    const date = now.getYear().toString() + now.getMonth() + now.getDate();
    const name = [prefix, date, "-", process.pid, "-", random].join("");

    return path.join(TMP_DIR, name);
}

module.exports = makeTemporaryPath;
