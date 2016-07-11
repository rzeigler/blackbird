/* eslint no-confusing-arrow: off */
module.exports = (app, response) =>
    (conn) => conn.pathname === "/favicon.ico" ? response || 404 : conn.run(app);
