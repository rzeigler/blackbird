const R = require("ramda");
const {pre} = require("./combinators");
const {promise: {alwaysReject}} = require("../data");
const {authorizationView, unauthorizedResponse, verifyAuth} = require("./basic-auth-lib");

const basicAuth = R.curry((realm, verify) => pre(
    R.cond([
        [R.complement(authorizationView), alwaysReject(unauthorizedResponse(realm))],
        [R.T, verifyAuth(verify)]
    ])
));

module.exports = basicAuth;
