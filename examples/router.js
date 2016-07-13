const BB = require("../src");
const app = BB.stack();

app.use(BB.logger);
app.use(BB.file, `${__dirname}/..`);
app.map("/ex", function (app) {
    app.use(BB.file, __dirname);
});

app.get("/", function () {
    return "Hello world!";
});

app.get("/motd", function () {
    return "Do not go where the path may lead, go instead where there is no path and leave a trail.";
});

BB.serve(app);
