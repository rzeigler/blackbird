/*eslint no-process-env: off*/
module.exports = {
    https: process.env.HTTPS,
    serverName: process.env.SERVER_NAME,
    withRedis: process.env.WITH_REDIS
};
