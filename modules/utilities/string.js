const R = require("ramda");

module.exports = {
    split: R.invoker(1, "split"),
    trim: R.invoker(0, "trim"),
    length: R.prop("length")
};
