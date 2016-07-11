const {lens, assoc, dissoc} = require("ramda");
const option = require("./option");

const assocLens = (key) =>
    lens((s) => option.inhabit(s[key]),
         (x) => console.log(x));

module.exports = {assocLens};
