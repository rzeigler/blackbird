const daggy = require("daggy");
const R = require("ramda");

const PathType = daggy.taggedSum({
    path: ["p"],
    mount: ["p"]
});

const path = PathType.path;
const mount = PathType.mount;
