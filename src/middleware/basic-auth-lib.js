const R = require("ramda");
const Promise = require("bluebird");
const base64 = require("base-64");
const {Some, None} = require("fantasy-options");
const {option, promise: {alwaysReject}} = require("../data");
const {makeResponse, contextHeadersLens} = require("../core");

const unauthorizedResponse = (realm) => makeResponse(401, {"WWW-Authenticate": `Basic realm=${realm}`}, "Unauthorized");
const forbiddenResponse = makeResponse(403, {}, "Forbidden");

const authorizationView = R.view(R.compose(contextHeadersLens, R.lensProp("authorization")));

const regEx = /Basic\s+([a-zA-Z0-9+/=]+)$/;

const decodeCredentials = R.tryCatch((b64) => {
    // May throw if the characters are valid, but doesn't decode properly
    const str = base64.decode(b64);
    const [username, password, ...rest] = str.split(":");
    if (R.isNil(password) || R.gt(R.length(rest), 0)) {
        return None;
    }
    return Some({username, password});
}, R.always(None));

const credentialsGroup = R.nth(1);

const extractCredentials = (str) => option.inhabit(regEx.exec(str))
        .map(credentialsGroup)
        .chain(decodeCredentials);

const runCheck = R.curry((verify, ctx, {username, password}) => Promise.resolve(verify(username, password))
    .then(R.cond([
        // If the verify responded with somethign truthy, assoc it onto the context
        [R.identity, R.compose(Promise.resolve, R.merge(ctx), R.objOf("auth"))],
        // Otherwise forbidden, prevent bluebird unhandled rejection
        [R.T, alwaysReject(forbiddenResponse)]
    ]))
);

// We can assume the header is there
const verifyAuth = R.curry((verify, ctx) => extractCredentials(authorizationView(ctx))
        .fold(runCheck(verify, ctx), alwaysReject(forbiddenResponse))
);

module.exports = {
    runCheck,
    verifyAuth,
    extractCredentials,
    decodeCredentials,
    authorizationView,
    unauthorizedResponse
};
