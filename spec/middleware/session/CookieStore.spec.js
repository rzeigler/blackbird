const {parallel} = require("../../loader");
const CookieStore = parallel(require, __filename);
const describeSessionStore = require("./describeSessionStore");

describe("CookieStore", function () {
    describeSessionStore(
    new CookieStore({secret: "secret"})
  );
});
