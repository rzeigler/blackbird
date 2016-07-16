module.exports = (function ({invoker, prop}) {
    return {
        split: invoker(1, "split"),
        trim: invoker(0, "trim"),
        length: prop("length"),
        replace: invoker(2, "replace"),
        match: invoker(1, "match"),
        toLowerCase: invoker(0, "toLowerCase")
    };
}(require("ramda")));
