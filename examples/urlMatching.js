const BB = require("../src");
const app = BB.stack();

app.use(BB.logger);

app.get("/", function () {
    return "<a href=\"/b\">go to b</a>";
});

app.get("/b", function () {
    return `<a href="/c/${Date.now()}">go to c</a>`;
});

app.get("/c/:id", function (conn) {
    return JSON.stringify({
        method: conn.method,
        location: conn.location,
        headers: conn.request.headers,
        params: conn.params
    }, null, 2);
});

BB.serve(app);
