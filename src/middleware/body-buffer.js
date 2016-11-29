const R = require("ramda");
const {
    contextConsumeContent,
    bufferEmitter
} = require("../core");
const {pre} = require("./combinators");

const attachBody = R.curry((ctx, buf) => R.merge(ctx, R.objOf("body", buf)));

module.exports = pre((ctx) => contextConsumeContent(bufferEmitter, ctx)
        .then((buf) => buf.length > 0 ? attachBody(ctx, buf) : ctx));
