const R = require("ramda");
const {core, router} = require("../src");
const {serve, response} = core;
const {path: {Path, shorthand}, corsDispatcher} = router;

const dispatcher = corsDispatcher({allowOrigin: "*"});

let a = 0, b = 0;
serve.serve(5000, router.router([
    Path.Route(shorthand("/a/:id/"), dispatcher([
            ["get", R.cond([
                [R.compose(R.propEq("id", "a"), R.prop("params")),
                    () => response.response(200, {}, a.toString())],
                [R.compose(R.propEq("id", "b"), R.prop("params")),
                    () => response.response(200, {}, b.toString())],
                [R.T, (ctx) => Promise.reject(response.response(404, {}, ctx.params.toString()))]
            ])],
            ["post", R.cond([
                [R.compose(R.propEq("id", "a"), R.prop("params")),
                    () => {
                        a = 0;
                        return response.response(200, {}, a.toString());
                    }],
                [R.compose(R.propEq("id", "b"), R.prop("params")),
                    () => {
                        b = 0;
                        return response.response(200, {}, b.toString());
                    }],
                [R.T, (ctx) => Promise.reject(response.response(404, {}, ctx.params.toString()))]
            ])]
    ])),
    Path.Route(shorthand("/a/:id/increment"), dispatcher([
            ["post", (ctx) => {
                if (ctx.params.id === "a") {
                    a++;
                    return response.response(200, {}, a.toString());
                }
                if (ctx.params.id === "b") {
                    b++;
                    return response.response(200, {}, b.toString());
                }
                return response.response(404, {}, null);
            }]
    ]))
]));
