const {expect} = require("chai");
const {lib, parallel} = require("../loader");
const {emitter: mockEmitter} = require("../mocks");
const bodyBuffer = parallel(require, __filename);
const {makeResponse, makeContext} = lib(require, "./core");

describe("middleware", () => {
    const baseApp = (ctx) => Promise.resolve(makeResponse(200, {}, ctx.body));

    describe("bodyBuffer", () => {
        it("should accumulate the body stream into body", () => {
            const mockRequest = mockEmitter([Buffer.from("Its going to be awesome")]);
            mockRequest.url = "http://localhost/foo";
            return bodyBuffer(baseApp, makeContext(mockRequest))
                .then((rsp) => expect(rsp).to.eql(makeResponse(200, {}, Buffer.from("Its going to be awesome"))));
        });
    });
});
