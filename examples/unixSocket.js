const BB = require("../src");
const app = BB.stack();

app.use(BB.gzip);
app.use(BB.logger);
app.use(BB.file, `${__dirname}/..`);

BB.serve(app, "/tmp/BB.sock");
