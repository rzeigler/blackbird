const RedisStore = require("../RedisStore");
const describeSessionStore = require("./describeSessionStore");
const config = require("../../../../config");

describe("RedisStore", function () {
    describeSessionStore(
    new RedisStore({secret: "secret"}),
    config.withRedis !== "1"
  );
});
