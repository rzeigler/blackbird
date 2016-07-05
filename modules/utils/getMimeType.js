let MimeTypes = require("../MimeTypes");
let ExtTypes = {};

Object.keys(MimeTypes).forEach(function (type) {
    MimeTypes[type].forEach(function (ext) {
        ExtTypes[ext] = type;
    });
});

let DEFAULT_TYPE = "application/octet-stream";
let EXT_MATCHER = /\.(\w+)$/;

function getMimeType(file, defaultType) {
    let match = file.match(EXT_MATCHER);
    return match && ExtTypes[match[1]] || defaultType || DEFAULT_TYPE;
}

module.exports = getMimeType;
