Master Branch: [![CircleCI](https://circleci.com/gh/theqabalist/blackbird.svg?style=svg&circle-token=d32d4715e49ec8dcda656acfe86280b446a57af3)](https://circleci.com/gh/theqabalist/blackbird)

[Blackbird](https://github.com/theqabalist/blackbird) is an HTTP server that runs on Node (ES6+). It has the following goals:

  * Asynchronous: Blackbird servers return Promises.
  * Composable: Blackbird servers are just a function of specific particular type. All Blackbird decorators return and accept functions of this type making custom extensions easy.
  * Descriptive: Components like routing and method dispatch use easy to read specifications for describing routes.
  * Powerful: Blackbird supports type coercing route parameters, CORS, hierarchical routing and dispatch, and a content negotiation mechanism.

### Servers

Writing a "Hello world" HTTP server in BB is simple. For meatier examples, refer to the integration directory which contains test for the server subsystems.

```js
const {core} = require("blackbird-server");

core.serve(5000, (ctx) => Promise.resolve(core.response(200, {}, "Hello World!")));
```

All Blackbird applications receive a single argument: a [Context](https://github.com/theqabalist/blackbird/blob/master/src/core/context.js) object. This object contains information about the request including the method, headers, path, and the socket. The context also contains a guarded method to read the request body. This may be called only once or it will throw. The application returns a promise describing the response to send. The body may be a String or a Buffer.

### routing

```js
const {core, router: {router, path}} = require("blackbird-server");

core.serve(5000, router([
    path.Route([path.lit("a"), path.nat("id")],
      (ctx) => Promise.resolve(core.response(200, {}, `Received ${ctx.params.id}`))),
    path.Route(path.shorthand(["/a/b/:other"]),
      (ctx) => Promise.resolve(core.response(200, {}, `Other was ${ctx.params.other}`)))
]));
```

Blackbird subsystems produce and accept Blackbird handlers of the type Context -> Promise Response. Here, you can see this in play as the router is a factory for a blackbird server based on a ruoting definition. It accepts Blackbird handlers for each route.

Route definitions are slightly more verbose in Blackbird than in other server frameworks. The reason for this is the features provided by the route specification system. Each route is describe as an array of matchers. For instance, the first route matches paths of the form "/a/5". This may not seem impressive, except for the fact that in the handler, ctx.params.id is already a number. This mechanism can be extended to provide matchers for any desired type including short ids, or mongo object ids freeing handlers from needing to implement custom validation or coercion logic.

A shorthand form is provided by the shorthand function. This accepts an array of strings and path matchers. The strings should be of the form of a route definition in express. The example `shorthand(["/a/b/:other"])` expands to `[lit("a"), lit("b"), any("other")]`. You can intermix other matchers in the array to get coerced parameters.

#### Method dispatch
Method dispatch is handled in a similar fashion. Notice also that the method dispatcher is used in absence of the router. All of the Blackbird subsystems are useable in isolation or composable in any order. That said, generally you want to order them as router then dispatcher then content negotiator.

```js
core.serve(5000, dispatcher({
    post: (ctx) => response.response(200, {}, "A POST happened")
}));
```

### Middleware
Blackbird does include a traditional middleware solution although there are currently few provided. At the moment, is a body buffer middleware and a basic auth middleware. They are used as function decorates.

```js
const baseApp = (ctx) => Promise.resolve(response(200, {}, ctx.body));
const app = bodyBuffer(baseApp);
```

### Content Negotiation

```js
serve(port, negotiator([
    responder(codecs.jsonDecoder, codecs.plainTextEncoder,
        (ctx) => Promise.resolve(response.response(200, {}, ctx.body.message))),
    responder(codecs.plainTextDecoder, codecs.jsonEncoder,
        (ctx) => Promise.resolve(response.response(200, {}, {message: ctx.body})))
]));
```

This defines a negotiator with several responders.
Responders describe the ways in which the server will negotiate content types with a client.
Each responder has an optional decoder, optional encoder, and a handler. When the responder handler runs, it receives the decoded input body as `ctx.body`. Its response body is the encoded with the responder encoder.
Responders that do not decode a body (such as GETs) or those that send no content, such as 204 responders do not need the relevant side of the codec.

### Installation

Using [npm](https://www.npmjs.org/):

    $ npm install blackbird

### Issues

Please file issues on the [issue tracker on GitHub](https://github.com/theqabalist/blackbird/issues).

### Tests

To run the tests in node:

    $ npm install
    $ npm test
    $ npm run integration


### Influences

  * [Strata](http://stratajs.org/)
  * [Q-HTTP](https://github.com/kriskowal/q-http)
  * [JSGI & Jack](http://jackjs.org/)
  * [node.js](http://nodejs.org/)
  * [Mach](http:/github.com/mjackson/mach)

### License

[MIT](http://opensource.org/licenses/MIT)
