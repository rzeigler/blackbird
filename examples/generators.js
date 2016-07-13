// To run this example you need to run node in harmony-compat mode.
// I've tested it with node 0.11.2 like this:
//   node --harmony examples/generators.js

const BB = require("../src");
const app = BB.stack();
const Promise = require("bluebird");

app.use(BB.logger);

app.run(Promise.coroutine(function* (request) {
    const body = yield request.parseContent();

    console.log("Sleeping");
    yield Promise.delay(200);

    return JSON.stringify(body);
}));

BB.serve(app);
