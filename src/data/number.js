const R = require("ramda");

const parseI = R.curryN(2, R.flip(parseInt));

const parseInt10 = parseI(10);

const parseInt8 = parseI(8);

const parseInt16 = parseI(16);

module.exports = {
    parseInt: parseI,
    parseInt10,
    parseInt8,
    parseInt16
};
