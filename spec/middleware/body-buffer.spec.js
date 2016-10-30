const {expect} = require("chai");
const {lib, parallel} = require("../loader");
const {emitter: mockEmitter} = require("../mocks");
const bodyBuffer = parallel(require, __filename);
const {response: {response}, context: {context}} = lib(require, "./core");

describe("middleware", () => {
    const baseApp = (ctx) => Promise.resolve(response(200, {}, ctx.body));

    describe("bodyBuffer", () => {
        it("should accumulate the body stream into body", () => {
            const mockRequest = mockEmitter([Buffer.from("Its going to be awesome")]);
            mockRequest.url = "http://localhost/foo";
            return bodyBuffer(baseApp, context(mockRequest))
                .then((rsp) => expect(rsp).to.eql(response(200, {}, Buffer.from("Its going to be awesome"))));
        });
    });
});
