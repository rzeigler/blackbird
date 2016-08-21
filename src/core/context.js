const R = require("ramda");
const {string, number} = require("../data");
const {parse: urlParse} = require("url");

/**
 * State and atom store for data event emitters. Prevents multiple attempts to consume the body
 */
function Content(request) {
    let consumed = false;

    this.consumeContent = function (f) {
        if (consumed) {
            throw new Error("Content has already been consumed");
        }
        consumed = true;
        return f(request);
    };
}

const isEmptyString = R.compose(R.equals(0), string.length);

const split = R.compose(R.filter(R.complement(isEmptyString)), string.split("/"));

const urlStruct = (url) => {
    const {query, pathname} = urlParse(url, true);
    return {
        query,
        path: pathname,
        pathSplit: split(pathname)
    };
};

/**
 * Value constructor for context objects. Construct a context object with the listed fields from the request and
 * containing a Content object built from the request in the content field
 */
const context = (request) => R.mergeAll([
    R.pick(["socket", "httpVersion", "method", "headers"], request),
    R.compose(R.objOf("content"), R.construct(Content))(request),
    R.compose(urlStruct, R.prop("url"))(request)
]);

const overContextParams = R.over(R.lensProp("params"));
/**
 * Run a continuation for consuming the body on the body
 */
const consumeContextContent = R.curry((f, context) => context.content.consumeContent(f));

const consumeContent = R.curry((f, content) => content.consumeContent(f));

const headersLens = R.lensProp("headers");
const headersView = R.lensProp("headersView");

const contentLengthLens = R.compose(headersLens, R.lensProp("content-length"));

const hasBody = (ctx) =>
    number.parseInt10(R.view(contentLengthLens, ctx)) > 0;

const contextContentLens = R.lensProp("content");

module.exports = {
    urlStruct,
    context,
    contextContentLens,
    overContextParams,
    consumeContextContent,
    consumeContent,
    headersLens,
    headersView,
    contentLengthLens,
    hasBody
};
