// To run this example you need to run node in harmony-compat mode.
// I've tested it with node 0.11.2 like this:
//   node --harmony examples/generators.js

let mach = require("../modules");
let app  = mach.stack();
let Q    = require("q");

function sleep(millis, answer) {
    const deferredResult = Q.defer();
    setTimeout(function () {
        deferredResult.resolve(answer);
    }, millis);
    return deferredResult.promise;
}

app.use(mach.logger);

app.run(Q.async(function* (request) {
    let body = yield request.parseContent();

    console.log("Sleeping");
    yield sleep(200);

    return JSON.stringify(body);
}));

mach.serve(app);
