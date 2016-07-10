module.exports = (function ({Some: some, None: none}) {
    return {inhabit: (v) => v ? some(v) : none};
}(require("fantasy-options")));
