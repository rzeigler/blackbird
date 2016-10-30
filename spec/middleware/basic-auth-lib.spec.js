const {expect} = require("chai");
const {parallel} = require("../loader");
const {Some, None} = require("fantasy-options");
const {encode} = require("base-64");
const {decodeCredentials, extractCredentials} = parallel(require, __filename);

describe("middleware", () => {
    describe("basic-auth-lib", () => {
        describe("decodeCredentials", () => {
            it("should decode username and password", () => {
                expect(decodeCredentials("QWxhZGRpbjpPcGVuU2VzYW1l"))
                    .to.eql(Some({username: "Aladdin", password: "OpenSesame"}));
            });
            it("should fail to decode credentials with too many colons", () => {
                expect(decodeCredentials(encode("ryan:pass:extra")))
                    .to.eql(None);
            });
            it("should fail to decode credentials with insufficient colons", () => {
                expect(decodeCredentials(encode("ryan")))
                    .to.eql(None);
            });
        });
        describe("credentials", () => {
            it("should decode an authorization header", () => {
                expect(extractCredentials("Basic QWxhZGRpbjpPcGVuU2VzYW1l"))
                    .to.eql(Some({username: "Aladdin", password: "OpenSesame"}));
            });
        });
    });
});
