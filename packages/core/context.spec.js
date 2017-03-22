const EventEmitter = require("events");
const {expect} = require("chai");
const {sequentially} = require("kefir");
const {
    streamEmitter,
    concatBufferStream,
    futurizeStream
} = require("./context");

describe("context", () => {
    describe("#streamEmitter", (done) => {
        it("should construct a stream that proxies emitter events", () => {
            const rendered = [];
            const emitter = new EventEmitter();
            const stream = streamEmitter(emitter);
            stream.observe({
                value(v) {
                    rendered.push(v);
                },
                end() {
                    expect(rendered).to.eql([1, 2, 3]);
                    done();
                }
            });
        });
    });
    describe("#concatBufferStream", () => {
        it("should produce a single final buffer", (done) => {
            concatBufferStream(sequentially(1, [
                Buffer.from("abc", {encoding: "utf8"}),
                Buffer.from("def", {encoding: "utf8"}),
                Buffer.from("ghi", {encoding: "utf8"})
            ])).observe({
                value(v) {
                    expect(v).to.eql(Buffer.from("abcdefghi", {encoding: "utf8"}));
                    done();
                }
            });
        });
    });
    describe("futurizeStream", () => {
        it("should result in a future that exposes the last value of the stream", (done) => {
            futurizeStream(sequentially(1, ["abc"]))
                .fork((e) => done(e), (v) => {
                    expect(v).to.equal("abc");
                    done();
                });
        });
    });
});
