// const {expect} = require("chai");
// const request = require("request-promise");
// const {serve, response} = require("../src/core");
// const {negotiators, responder, codecs} = require("../src/negotiator");
// const Promise = require("bluebird");
// const R = require("ramda");
//
// /* eslint no-process-env: 0 */
// const port = parseInt(process.env.PORT || "8888", 10);
// const host = `http://localhost:${port}`;
//
// describe("negotiator", () => {
//     let server = null;
//     beforeEach(() =>
//         serve(port, negotiator([
//             responder(codecs.jsonDecoder, codecs.plainTextEncoder, R.identity),
//             responder(codecs.plainTextDecoder, codecs.jsonEncoder, R.identity)
//         ]))
//         .then((srv) => {
//             server = srv;
//         })
//     );
//
//     afterEach(function () {
//         server.close();
//     });
//
//     it("should return plain text when json is submitted", function () {
//         return request(host)
//             .then((text) => expect(text).to.equal("Hello, World!"));
//     });
// });
