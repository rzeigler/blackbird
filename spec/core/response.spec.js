const {expect} = require("chai");
const {parallel} = require("../loader");
const response = parallel(require, __filename);

describe("core", () => {
    describe("response", () => {
        describe("#inflateStringBody", function () {
            it("should inflate a response structure from a string", function () {
                const inflated = response.inflateStringBody("abcdefg");
                expect(inflated.statusCode).to.equal(200);
                expect(inflated.headers).to.eql({"content-type": "text/plain; charset=utf-8"});
                expect(inflated.body).to.eql(Buffer.from("abcdefg"));
            });
        });
        describe("#isStringMap", function () {
            it("should return true for empty objects", function () {
                expect(response.isStringMap({})).to.equal(true);
            });
            it("should return true for object with string properties", function () {
                expect(response.isStringMap({a: "a", b: "b"})).to.equal(true);
            });
            it("should return false for non-'objects'", function () {
                expect(response.isStringMap("b")).to.equal(false);
            });
            it("should return false for objects with non-string properties", function () {
                expect(response.isStringMap({a: "a", b: 8})).to.equal(false);
            });
        });
        describe("#isConformingResponse", function () {
            it("should return true for a valid response with headers", function () {
                expect(response.isConformingResponse({
                    statusCode: 200,
                    headers: {"content-type": "text/plain"},
                    body: Buffer.from("Hello, World!")
                })).to.equal(true);
            });
            it("should return true for a valid response without a body", function () {
                expect(response.isConformingResponse({
                    statusCode: 200,
                    headers: {},
                    body: null
                })).to.equal(true);
            });
            it("should return true for a valid response without headers", function () {
                expect(response.isConformingResponse({
                    statusCode: 200,
                    body: Buffer.from("Hello, World!")
                })).to.equal(true);
            });
            it("should return true for a valid response with empty headers", function () {
                expect(response.isConformingResponse({
                    statusCode: 200,
                    headers: {},
                    body: Buffer.from("Hello, World!")
                })).to.equal(true);
            });
            it("should return false for a response without a statusCode", function () {
                expect(response.isConformingResponse({body: Buffer.from("Hello, World!")}))
                    .to.equal(false);
            });
            it("should return false for a response with random headers", function () {
                expect(response.isConformingResponse({
                    statusCode: 200,
                    body: Buffer.from("Hello, World!"),
                    headers: {a: 5}
                })).to.equal(false);

                expect(response.isConformingResponse({
                    statusCode: 200,
                    body: Buffer.from("Hello, World!"),
                    headers: "a"
                })).to.equal(false);
            });
            it("should return false for a response with a body that is not buffer or a string", function () {
                expect(response.isConformingResponse({statusCode: 200, body: {v: "rekt!"}}))
                    .to.equal(false);
            });
            it("should return false for a response with a random statusCode", function () {
                expect(response.isConformingResponse({statusCode: "a", body: Buffer.from("rekt!")}))
                    .to.equal(false);
            });
        });
        describe("#inflateResponse", function () {
            it("should inflate buffers", function () {
                expect(response.inflateResponse(Buffer.from("boo!")))
                    .to.eql({
                        statusCode: 200,
                        headers: {"content-type": "application/octet-stream"},
                        body: Buffer.from("boo!")
                    });
            });
            it("should inflate strings", function () {
                expect(response.inflateResponse("boo!"))
                    .to.eql({
                        statusCode: 200,
                        headers: {"content-type": "text/plain; charset=utf-8"},
                        body: Buffer.from("boo!")
                    });
            });
            it("should accept conforming response", function () {
                const payload = {
                    statusCode: 200,
                    headers: {"content-type": "application/octet-stream"},
                    body: Buffer.from("boo!")
                };
                expect(response.inflateResponse(payload))
                    .to.eql(payload);
            });
        });
        describe("#conditionResponse", function () {
            it("should attach content-length when there is a body", function () {
                const body = response.bufferFromUtf8("Hello, World");
                expect(response.conditionResponse(response.response(200, {}, body)).headers["content-length"])
                    .to.equal(Buffer.byteLength(body).toString());
            });
        });
        describe("#inflateBufferBody", function () {
            it("should inflate a response structure from a buffer", function () {
                const buffer = Buffer.from("abcdefg");
                const result = response.inflateBufferBody(buffer);
                expect(result.statusCode).to.equal(200);
                expect(result.headers).to.eql({"content-type": "application/octet-stream"});
                expect(result.body).to.equal(buffer);
            });
        });
    });
});
