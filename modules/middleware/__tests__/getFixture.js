let fs = require("fs");
let path = require("path");
let fixturesDir = path.join(__dirname, "fixtures");

function getFixture(fixtureName) {
    return fs.readFileSync(path.join(fixturesDir, fixtureName), arguments[1]);
}

module.exports = getFixture;
