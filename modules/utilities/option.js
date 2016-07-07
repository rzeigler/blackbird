const Option = require("fantasy-options");

const some = Option.Some;
const none = Option.None;

function guard(v) {
    return v ? some(v) : none;
}

module.exports = {guard, some, none};
