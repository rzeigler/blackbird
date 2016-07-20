const {expect} = require("chai");
const {parallel} = require("../loader");
const EventEmitter = require("events");
const body = parallel(require, __filename);

describe("core/body", function () {
    describe("#body", function () {
        it("should buffer a fixed buffer", function () {
            const buffer1 = Buffer.from("I've got a lovely bunch of coconuts");
            const buffer2 = Buffer.from("There they are standing in a row");
            const buffer3 = Buffer.from("Big ones, small ones, some as big as your head");

            const emitter = new EventEmitter();

            const buffered = body.buffer(emitter);
            emitter.emit("data", buffer1);
            emitter.emit("data", buffer2);
            emitter.emit("data", buffer3);
            emitter.emit("end");
            return buffered.then((buf) => expect(buf.compare(Buffer.concat([buffer1, buffer2, buffer3]))).to.equal(0));
        });
    });
});
