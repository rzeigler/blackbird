module.exports = (function ({resolve}, {curry}) {
    return {
        lib: curry((r, path) => r(resolve(process.cwd(), "src", path))),
        parallel(r, path) {
            return r(path.replace(/\/spec\//g, "/src/").replace(/\.spec/g, ""));
        }
    };
}(
    require("path"),
    require("ramda")
));
