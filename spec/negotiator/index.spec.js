const R = require("ramda");
const {expect} = require("chai");
const {parallel, lib} = require("../loader");
const {Right, Left} = require("fantasy-eithers");
const {
    parsePrio,
    parseMediaPrios,
    ensurePrio,
    omitPrio,
    defaultPrio,
    filterDecodingResponders,
    selectEncodingResponder,
    encoder,
    decoder,
    responder
} = parallel(require, __filename);
const {
    defineParamConstraint,
    defineMediaConstraint,
    stringCoercion,
    isMember,
    Some
} = lib(require, "./negotiator/constraint");
const {media} = lib(require, "./media");

// const {response: {response, statusCodes}} = lib(require, "./core");

describe("negotiator", () => {
    const htmlConstraint = defineMediaConstraint("text", "html", [
        defineParamConstraint("charset", stringCoercion, isMember(["utf8", "ascii"]), Some("utf8"))
    ], false);
    const plainConstraint = defineMediaConstraint("text", "plain", [
        defineParamConstraint("charset", stringCoercion, isMember(["utf8", "ascii"]), Some("utf8"))
    ], true);

    describe("parsePrio", () => {
        it("should parse the priority of a media type", () => {
            expect(parsePrio(media("text", "html", {q: "0.8"})))
                .to.eql(Right(media("text", "html", {q: 0.8})));
        });
        it("should reject invalid priorities", () => {
            expect(parsePrio(media("text", "html", {q: "a"})))
                .to.be.an.instanceof(Left);
        });
    });
    describe("defaultPrio", () => {
        it("should attach 1 to normal media types", () => {
            expect(defaultPrio(media("text", "html", {})))
                .to.eql(media("text", "html", {q: "1"}));
        });
        it("should attach 0.02 to subtype wildcards", () => {
            expect(defaultPrio(media("text", "*", {})))
                .to.eql(media("text", "*", {q: "0.02"}));
        });
        it("should attach 0.01 to full wildcards", () => {
            expect(defaultPrio(media("*", "*", {})))
                .to.eql(media("*", "*", {q: "0.01"}));
        });
    });
    describe("ensurePrio", () => {
        it("should add priority to media types where it is unspecified", () => {
            expect(ensurePrio(media("text", "html", {encoding: "utf8"})))
                .to.eql(media("text", "html", {encoding: "utf8", q: "1"}));
        });
        it("should do nothing when a quality is already present", () => {
            expect(ensurePrio(media("text", "html", {q: "0.8"})))
                .to.eql(media("text", "html", {q: "0.8"}));
        });
    });
    describe("omitPrio", () => {
        it("should strip priority", () => {
            expect(omitPrio(media("text", "html", {q: 0.8})))
                .to.eql(media("text", "html", {}));
        });
    });
    describe("filterDecodingResponders", () => {
        const responders = [
            responder(null, encoder(htmlConstraint, null), R.identity),
            responder(
                decoder(plainConstraint, R.identity),
                encoder(htmlConstraint, R.identity),
                null
            )
        ];
        it("if no content type, only responders with no decoder should be selected", () => {
            expect(filterDecodingResponders(null, responders))
                .to.eql(Right([responders[0]]));
        });
        it("if a content type is set, only responders that can decode that type should be selected", () => {
            expect(filterDecodingResponders(media("text", "plain", {encoding: "utf8"}), responders))
                .to.eql(Right([responders[1]]));
        });
        it("if a content type is set but there is no valid decoder for that type but there are responders" +
                "that do not decode input, those may be selected", () => {
            expect(filterDecodingResponders(media("text", "xml", {}), responders))
                .to.eql(Right([responders[0]]));
        });
        it("if no handlers for the content type exist unsupported media type should be returned", () => {
            expect(filterDecodingResponders(media("text", "xml", {}), [responders[1]]))
                .to.be.instanceof(Left);
        });
    });
    describe("parseMediaPrios", () => {
        it("should succeed on correct priorities", () => {
            expect(parseMediaPrios([media("text", "html", {q: "0.5"})]))
                .to.eql(Right([media("text", "html", {q: 0.5})]));
        });
        it("should fail on invalid priorities", () => {
            expect(parseMediaPrios([media("text", "html", {q: "a"})]))
                .to.be.an.instanceof(Left);
        });
    });
    describe("selectEncodingResponder", () => {
        // const htmlC = defineMediaConstraint("text", "html", [], false);
        const xmlC = defineMediaConstraint("text", "xml", [], false);
        // const texC = defineMediaConstraint("text", "tex", [], false);
        const plainC = defineMediaConstraint("text", "plain", [], false);

        const html = media("text", "html", {});
        const xml = media("text", "xml", {});
        const tex = media("text", "tex", {});

        const xmlResponder = responder(decoder(xmlC, null), encoder(xmlC, null), R.identity);
        const plainResponder = responder(decoder(plainC, null), encoder(plainC, null), R.identity);
        const noContentResponder = responder(decoder(plainC, null), null, R.identity);
        const acceptMedias = [
            html,
            xml,
            tex
        ];
        it("should select a responder from a list", () => {
            expect(selectEncodingResponder(acceptMedias, [xmlResponder, plainResponder]))
                .to.eql(Right({
                    type: media("text", "xml", {}),
                    responder: xmlResponder
                }));
        });
        it("should fail when no responder is available", () => {
            expect(selectEncodingResponder(acceptMedias, [plainResponder]))
                .to.be.instanceof(Left);
        });
        it("should succeed with a no-content responder in the case of no matching media types", () => {
            expect(selectEncodingResponder(acceptMedias, [noContentResponder, plainResponder]))
                .to.eql(Right({
                    type: media("text", "tex", {}),
                    responder: noContentResponder
                }));
        });
    });
});
