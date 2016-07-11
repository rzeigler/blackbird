const fs = require("fs");
const path = require("path");
const fixturesDir = path.join(__dirname, "fixtures");

function getFixture(fixtureName, other) {
    return fs.readFileSync(path.join(fixturesDir, fixtureName), other);
}

module.exports = getFixture;
