const td = require("testdouble");
const request = require("supertest");
const Future = require("fluture").Future;
const {always} = require("ramda");
const {
    send,
    compile
} = require("./index");

const verify = (fn) => new Future((reject, resolve) => {
    try {
        fn();
        resolve();
    } catch (e) {
        reject(e);
    }
});

describe("index", () => {
    const res = {
        writeHead: td.function("writeHead"),
        write: td.function("write"),
        end: td.function("end")
    };
    afterEach(() => {
        td.reset();
    });
    describe("send", () => {
        it("should write on success", (done) => {
            send(res, {
                statusCode: 200,
                headers: {},
                body: "Hello"
            })
            .chain(always(verify(() => {
                td.verify(res.writeHead(200, {"Content-Length": "5"}));
                td.verify(res.write(Buffer.from("Hello")));
                td.verify(res.end());
            })))
            .fork(done, done);
        });
        it("should write on failure", (done) => {
            send(res, {
                statusCode: 404,
                headers: {},
                body: "Broken"
            })
            .chain(always(verify(() => {
                td.verify(res.writeHead(404, {"Content-Length": "6"}));
                td.verify(res.write(Buffer.from("Broken")));
                td.verify(res.end());
            })))
            .fork(done, done);
        });
        it("should write 500 for unrecognized structures", (done) => {
            send(res, "rando!")
            .chain(always(Future.reject("Shouldn't have succeeded")))
            .chainRej(always(verify(() => {
                td.verify(res.writeHead(500, {"Content-Type": "text/plain", "Content-Length": "21"}));
                td.verify(res.write(Buffer.from("Internal Server Error")));
                td.verify(res.end());
            })))
            .fork(done, done);
        });
    });
    describe("compileE", () => {
        it("should compile a handler that into a sender", (done) => {
            const app = compile((ctx) => Future.of({
                statusCode: 200,
                headers: {"Content-Type": "text/plain"},
                body: ctx.rawUrl
            }));
            request(app)
                .get("/something")
                .expect("Content-Type", "text/plain")
                .expect("Content-Length", "10")
                .expect(200, "/something", done);
        });
    });
});
