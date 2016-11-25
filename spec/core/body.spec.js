const {expect} = require("chai");
const {parallel} = require("../loader");
// const EventEmitter = require("events");
const {bufferEmitter} = parallel(require, __filename);
const {emitter: mockEmitter} = require("../mocks");

describe("core", function () {
    describe("body", function () {
        describe("buffer", function () {
            it("should buffer a fixed buffer", function () {
                const buffer1 = Buffer.from("I've got a lovely bunch of coconuts");
                const buffer2 = Buffer.from("There they are standing in a row");
                const buffer3 = Buffer.from("Big ones, small ones, some as big as your head");
                const buffered = bufferEmitter(mockEmitter([buffer1, buffer2, buffer3]));
                return buffered.then((buf) => expect(buf).to.eql(Buffer.concat([buffer1, buffer2, buffer3])));
            });
        });
    });
});
