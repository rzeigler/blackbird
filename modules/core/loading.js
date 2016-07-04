module.exports = (function (R) {
    function localName(s) { return `./${s}`; }
    return {
        locally: r => R.compose(r, localName)
    };
}(require("ramda")));
