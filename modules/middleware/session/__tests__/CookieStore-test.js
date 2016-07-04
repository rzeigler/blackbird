let CookieStore = require("../CookieStore");
let describeSessionStore = require("./describeSessionStore");

describe("CookieStore", function () {
    describeSessionStore(
    new CookieStore({
        secret: "secret"
    })
  );
});
