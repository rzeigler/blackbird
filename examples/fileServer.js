const mach = require("../modules");
const app = mach.stack();

app.use(mach.gzip);
app.use(mach.logger);
app.use(mach.modified);
app.use(mach.file, {
    root: `${__dirname}/..`,
    autoIndex: true,
    useLastModified: true,
    useETag: true
});

mach.serve(app);
