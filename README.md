[![build status](https://img.shields.io/travis/theqabalist/blackbird.svg?style=flat-square)](https://travis-ci.org/theqabalist/blackbird)
[![npm package](https://img.shields.io/npm/v/BB.svg?style=flat-square)](https://www.npmjs.org/package/BB)

[Blackbird](https://github.com/theqabalist/blackbird) is an HTTP server and client library that runs in both node.js and the browser. It has the following goals:

  * Simplicity: straightforward mapping of HTTP requests to JavaScript function calls
  * Asynchronous: responses can be deferred using Promises/A+ promises
  * Streaming: request and response bodies can be streamed
  * Composability: middleware composes easily using promises
  * Robustness: promises propagate errors up the call stack, simplifying error handling

### Servers

Writing a "Hello world" HTTP server in BB is simple.

```js
let BB = require('blackbird');

BB.serve(function (conn) {
  return "Hello world!";
});
```

All Blackbird applications receive a single argument: a [Connection](https://github.com/theqabalist/blackbird/blob/master/modules/Connection.js) object. This object contains information about both the request and the response, as well as metadata including the `method` used in the request, the [location](https://github.com/theqabalist/blackbird/blob/master/modules/Location.js) of the request, the `status` of the response, and some helper methods.

Applications can send responses asynchronously using JavaScript promises. Simply return a promise from your app that resolves when the response is ready.

```js
let app = BB.stack();

app.use(BB.logger);

app.get('/users/:id', function (conn) {
  let id = conn.params.id;

  return getUser(id).then(function (user) {
    conn.json(200, user);
  });
});
```

The call to `app.use` above illustrates how middleware is used to compose applications. BB ships with the following middleware:

- [`BB.basicAuth`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/basicAuth.js): Provides authentication using [HTTP Basic auth](http://en.wikipedia.org/wiki/Basic_access_authentication)
- [`BB.catch`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/catch.js): Error handling at any position in the stack
- [`BB.charset`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/charset.js): Provides a default [charset](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17) in responses
- [`BB.contentType`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/contentType.js): Provides a default [`Content-Type`](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17)
- [`BB.favicon`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/favicon.js): Handles requests for `/favicon.ico`
- [`BB.file`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/file.js): Efficiently serves static files
- [`BB.gzip`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/gzip.js): [Gzip](http://en.wikipedia.org/wiki/Gzip)-encodes response content for clients that `Accept: gzip`
- [`BB.logger`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/logger.js): Logs HTTP requests to the console
- [`BB.mapper`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/mapper.js): Provides virtual host mapping, similar to [Apache's Virtual Hosts](http://httpd.apache.org/docs/2.2/vhosts/) or [nginx server blocks](http://nginx.org/en/docs/http/ngx_http_core_module.html#server)
- [`BB.methodOverride`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/methodOverride.js): Overrides the HTTP method used in the request, for clients (like HTML forms) that don't support methods other than `GET` and `POST`
- [`BB.modified`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/modified.js): HTTP caching using [`Last-Modified`](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.29) and [`ETag`](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.19)
- [`BB.params`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/params.js): Multipart request parsing and handling
- [`BB.proxy`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/proxy.js): Proxy request through to an alternate location
- [`BB.rewrite`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/rewrite.js): Rewrites request URLs on the fly, similar to [Apache's mod_rewrite](http://httpd.apache.org/docs/current/mod/mod_rewrite.html)
- [`BB.router`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/router.js): Request routing (ala [Sinatra](http://www.sinatrarb.com/)) based on the URL pathname
- [`BB.session`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/session.js): HTTP sessions with pluggable storage including [memory](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/session/MemoryStore.js) (for development and testing), [cookies](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/session/CookieStore.js), and [Redis](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/session/RedisStore.js)
- [`BB.stack`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/stack.js): Provides a `use` mechanism for composing applications fronted by middleware
- [`BB.token`](https://github.com/theqabalist/blackbird/blob/master/modules/middleware/token.js): Cross-site request forgery protection

### Proxies

Because all BB applications share the same signature, it's easy to combine them in interesting ways. BB's HTTP proxy implementation illustrates this beautifully: a proxy is simply an application that forwards the request somewhere else.

```js
let proxyApp = BB.createProxy('http://twitter.com');

// In a server environment we can use the BB.proxy middleware
// to proxy all requests to the proxy's location.
app.use(BB.proxy, proxyApp);

// In a client application we can call the proxy directly to
// send a request to the proxy's location.
BB.post(proxyApp, {
  params: {
    username: 'bkeown'
  }
});
```

### Installation

Using [npm](https://www.npmjs.org/):

    $ npm install blackbird

### Issues

Please file issues on the [issue tracker on GitHub](https://github.com/theqabalist/blackbird/issues).

### Tests

To run the tests in node:

    $ npm install
    $ npm test

The Redis session store tests rely on Redis to run successfully. By default they are skipped, but if you want to run them fire up a Redis server on the default host and port and set the `$WITH_REDIS` environment variable.

    $ WITH_REDIS=1 npm test

To run the tests in Chrome:

    $ npm install
    $ npm run test-browser

### Influences

  * [Strata](http://stratajs.org/)
  * [Q-HTTP](https://github.com/kriskowal/q-http)
  * [JSGI & Jack](http://jackjs.org/)
  * [node.js](http://nodejs.org/)
  * [Mach](http:/github.com/mjackson/mach)

### License

[MIT](http://opensource.org/licenses/MIT)
