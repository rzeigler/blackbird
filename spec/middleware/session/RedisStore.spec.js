const {parallel} = require("../../loader");
const RedisStore = parallel(require, __filename);
const describeSessionStore = require("./describeSessionStore");
const config = require("../../../config");

describe("RedisStore", function () {
    describeSessionStore(
    new RedisStore({secret: "secret"}),
    config.withRedis !== "1"
  );
});
