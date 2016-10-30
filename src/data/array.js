const R = require("ramda");

const cartesian = R.curry((left, right) => {
    const partial = R.ap(R.of(R.pair), left);
    return R.ap(partial, right);
});

module.exports = {
    length: R.prop("length"),
    join: R.invoker(1, "join"),
    cartesian
};
