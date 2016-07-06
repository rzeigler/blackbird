const MemoryStore = require("../MemoryStore");
const describeSessionStore = require("./describeSessionStore");

describe("MemoryStore", function () {
    describeSessionStore(
    new MemoryStore({secret: "secret"})
  );
});
