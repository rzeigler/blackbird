const assert = require("assert");
const expect = require("expect");
const callApp = require("../../utils/callApp");
const catchMiddleware = require("../catch");

describe("middleware/catch", function () {
    describe("when an Error is thrown from downstream", function () {
        it("throws it", function () {
            return callApp(
        catchMiddleware(function () {
            throw new Error("boom!");
        })
      ).then(function () {
          assert(false);
      }, function (error) {
          assert(error);
      });
        });
    });

    describe("when a non-Error is thrown from downstream", function () {
        it("returns it", function () {
            return callApp(
        catchMiddleware(function () {
            throw 404;
        })
      ).then(function (conn) {
          expect(conn.status).toEqual(404);
      });
        });
    });
});
