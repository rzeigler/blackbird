BB = require "../modules"

server = BB.serve BB.logger BB.map

    "/": -> '<a href="/foo">Foo</a>'

    "/foo": -> [200, {}, '<a href="/bar">Bar</a>']

    "/bar": (req) ->
        status: 200
        headers: "content-type": "application/json"
        content: JSON.stringify
            method: req.method
            path: req.path
            headers: req.headers
            , null, 2
