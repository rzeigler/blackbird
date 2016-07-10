const BB = require("../modules");
const app = BB.stack();

app.use(BB.gzip);
app.use(BB.logger);
app.use(BB.modified);
app.use(BB.file, {
    root: `${__dirname}/..`,
    autoIndex: true,
    useLastModified: true,
    useETag: true
});

BB.serve(app);
