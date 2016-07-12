const {curry, lens, assoc, dissoc, __} = require("ramda");
const option = require("./option");

const assocLens = function (key) {
    return lens((s) => option.inhabit(s[key]),
                curry((vOpt, s) => vOpt.fold(assoc(key, __, s),
                                             () => dissoc(key, s))));
};

module.exports = {assocLens};
