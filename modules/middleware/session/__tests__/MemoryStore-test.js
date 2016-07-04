let MemoryStore = require("../MemoryStore");
let describeSessionStore = require("./describeSessionStore");

describe("MemoryStore", function () {
    describeSessionStore(
    new MemoryStore({
        secret: "secret"
    })
  );
});
