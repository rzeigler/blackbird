module.exports = (function ({prop, head}) {
    return {
        first: head,
        second: prop(1),
        third: prop(2),
        nth: prop
    };
}(require("ramda")));
