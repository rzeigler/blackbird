const CookieStore = require("../CookieStore");
const describeSessionStore = require("./describeSessionStore");

describe("CookieStore", function () {
    describeSessionStore(
    new CookieStore({secret: "secret"})
  );
});
