const {parallel} = require("../../loader");
const MemoryStore = parallel(require, __filename);
const describeSessionStore = require("./describeSessionStore");

describe("MemoryStore", function () {
    describeSessionStore(
    new MemoryStore({secret: "secret"})
  );
});
