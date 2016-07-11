const {curry, lens, assoc, dissoc} = require("ramda");
const option = require("./option");

const assocLens = (key) => lens(
        (s) => option.inhabit(s[key]),
        curry((vOpt, s) =>
            vOpt.fold((v) => assoc(key, v, s),
                      () => dissoc(key, s))));

module.exports = {assocLens};
