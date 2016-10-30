const {
    core: {
        serve,
        response: {response}
    },
    middleware: {applyStack, basicAuth, bodyBuffer}
} = require("../src");

const verify = (username, password) => {
    if (password === "auth") {
        return username;
    }
};

const app = (ctx) =>
    Promise.resolve(response(200, {},
    `Hello, ${ctx.auth}. Enjoy the content at ${ctx.path}. You sent '${ctx.body ? ctx.body.toString() : "nothing"}'`));
const auth = basicAuth("test", verify);

serve(2000, applyStack([auth, bodyBuffer], app));
