/*eslint no-unused-expressions: off */
/*eslint max-statements: off */
const {expect} = require("chai");
const Location = require("../Location");

describe("an empty Location", function () {
    let location;
    beforeEach(function () {
        location = new Location();
    });

    it("has the correct href", function () {
        expect(location.href).to.equal("/");
    });
});

describe("a fully-specified Location", function () {
    let location;
    beforeEach(function () {
        location = new Location("http://user:pass@example.com:5000/the/path?the=query");
    });

    it("has the correct attributes", function () {
        expect(location.href).to.equal("http://user:pass@example.com:5000/the/path?the=query");
        expect(location.protocol).to.equal("http:");
        expect(location.auth).to.equal("user:pass");
        expect(location.host).to.equal("example.com:5000");
        expect(location.hostname).to.equal("example.com");
        expect(location.port).to.equal("5000");
        expect(location.pathname).to.equal("/the/path");
        expect(location.path).to.equal("/the/path?the=query");
        expect(location.search).to.equal("?the=query");
        expect(location.queryString).to.equal("the=query");
        expect(location.query).to.eql({the: "query"});
    });

    describe("with http: protocol on the standard port", function () {
        it("leaves the port # out of host", function () {
            const location = new Location("http://example.com:80/the/path");
            expect(location.host).to.equal("example.com");
        });
    });

    describe("with http: protocol on a non-standard port", function () {
        it("includes the port # in host", function () {
            const location = new Location("http://example.com:8080/the/path");
            expect(location.host).to.equal("example.com:8080");
        });
    });

    describe("with https: protocol on the standard port", function () {
        it("leaves the port # out of host", function () {
            const location = new Location("https://example.com:443/the/path");
            expect(location.host).to.equal("example.com");
        });
    });

    describe("with https: protocol on a non-standard port", function () {
        it("includes the port # in host", function () {
            const location = new Location("https://example.com:5000/the/path");
            expect(location.host).to.equal("example.com:5000");
        });
    });

    describe("when the href is set", function () {
        it("has the correct href", function () {
            location.href = "https://user:pass@example.net/another/path?another=query";
            expect(location.href).to.equal("https://user:pass@example.net/another/path?another=query");
        });
    });

    describe("when the protocol is set", function () {
        it("has the correct href", function () {
            location.protocol = "https:";
            expect(location.href).to.equal("https://user:pass@example.com:5000/the/path?the=query");
        });
    });

    describe("when the hostname is set", function () {
        it("has the correct href", function () {
            location.hostname = "example.net";
            expect(location.href).to.equal("http://user:pass@example.net:5000/the/path?the=query");
        });
    });

    describe("when the host is set", function () {
        describe("with a port", function () {
            it("has the correct href", function () {
                location.host = "example.net:8080";
                expect(location.href).to.equal("http://user:pass@example.net:8080/the/path?the=query");
            });
        });

        describe("without a port", function () {
            it("has the correct href", function () {
                location.host = "example.net";
                expect(location.href).to.equal("http://user:pass@example.net/the/path?the=query");
            });
        });
    });

    describe("when the port is set", function () {
        it("has the correct href", function () {
            location.port = 6000;
            expect(location.href).to.equal("http://user:pass@example.com:6000/the/path?the=query");
        });
    });

    describe("when the pathname is set", function () {
        it("has the correct href", function () {
            location.pathname = "/another/path";
            expect(location.href).to.equal("http://user:pass@example.com:5000/another/path?the=query");
        });
    });

    describe("when the path is set", function () {
        describe("with a search", function () {
            it("has the correct href", function () {
                location.path = "/another/path?another=query";
                expect(location.href).to.equal("http://user:pass@example.com:5000/another/path?another=query");
            });
        });

        describe("without a search", function () {
            it("has the correct href", function () {
                location.path = "/another/path";
                expect(location.href).to.equal("http://user:pass@example.com:5000/another/path");
            });
        });
    });

    describe("when the search is set", function () {
        it("has the correct href", function () {
            location.search = "?another=query";
            expect(location.href).to.equal("http://user:pass@example.com:5000/the/path?another=query");
        });
    });

    describe("when the queryString is set", function () {
        it("has the correct href", function () {
            location.queryString = "another=query";
            expect(location.href).to.equal("http://user:pass@example.com:5000/the/path?another=query");
        });
    });

    describe("when the query is set", function () {
        it("has the correct href", function () {
            location.query = {another: "query"};
            expect(location.href).to.equal("http://user:pass@example.com:5000/the/path?another=query");
        });
    });

    describe("when appending another location", function () {
        it("uses the new attributes", function () {
            location = location.concat("https://example.org/more/path?more=query");
            expect(location.protocol).to.equal("https:");
            expect(location.host).to.equal("example.org");
            expect(location.pathname).to.equal("/the/path/more/path");
            expect(location.query).to.eql({the: "query", more: "query"});
        });
    });
});

describe("a Location with only a path", function () {
    let location;
    beforeEach(function () {
        location = new Location("/the/path?the=query");
    });

    it("has nothing else", function () {
        expect(location.protocol).to.equal(null);
        expect(location.hostname).to.equal(null);
        expect(location.port).to.equal(null);
        expect(location.host).to.be.empty;
        expect(location.pathname).to.equal("/the/path");
        expect(location.query).to.eql({the: "query"});
    });
});

describe("a Location with no search", function () {
    it("has an empty search", function () {
        const location = new Location("/the/path");
        expect(location.search).to.equal("");
        expect(location.queryString).to.equal("");
        expect(location.query).to.eql({});
    });
});
