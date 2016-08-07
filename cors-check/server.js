const R = require("ramda");
const {core, router} = require("../src");
const {serve, response} = core;
const {path: {Path, shorthand}, corsDispatcher} = router;


const a = 2, b = 1;
serve.serve(5000, router.router([
    Path.Route(shorthand("/a/:id/"), corsDispatcher({
        get: R.cond([
            [R.compose(R.propEq("id", "a"), R.prop("params")),
                () => response.response(200, {Accessed: "a"}, a.toString())],
            [R.compose(R.propEq("id", "b"), R.prop("params")),
                () => response.response(200, {Accessed: "b"}, b.toString())],
            [R.T, (ctx) => Promise.reject(response.response(404, {}, ctx.params.toString()))]
        ])
    }))
]));
