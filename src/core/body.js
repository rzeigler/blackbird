const R = require("ramda");
const Promise = require("bluebird");

const bufferEmitter = R.curry((emitter) =>
    new Promise((resolve, reject) => {
        let length = 0;
        const buffers = [];

        const chunkRead = (chunk) => {
            const cLen = Buffer.byteLength(chunk);
            length += cLen;
            buffers.push(chunk);
        };

        emitter.on("data", chunkRead);
        emitter.on("end", () => resolve(Buffer.concat(buffers, length)));
        emitter.on("error", reject);
    }));

module.exports = {bufferEmitter};
