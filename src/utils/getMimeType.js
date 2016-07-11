const MimeTypes = require("../MimeTypes");
const ExtTypes = {};

Object.keys(MimeTypes).forEach(function (type) {
    MimeTypes[type].forEach(function (ext) {
        ExtTypes[ext] = type;
    });
});

const DEFAULT_TYPE = "application/octet-stream";
const EXT_MATCHER = /\.(\w+)$/;

function getMimeType(file, defaultType) {
    const match = file.match(EXT_MATCHER);
    return match && ExtTypes[match[1]] || defaultType || DEFAULT_TYPE;
}

module.exports = getMimeType;
