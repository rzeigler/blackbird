const R = require("ramda");

module.exports = {
    length: R.prop("length"),
    join: R.invoker(1, "join")
};
