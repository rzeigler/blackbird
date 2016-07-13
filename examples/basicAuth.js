const BB = require("../src");
const app = BB.stack();

app.use(BB.logger);
app.use(BB.basicAuth, function (user, pass) {
  // Allow anyone to login, as long as they use the password "password".
    return pass === "password";
});

app.run(function (conn) {
    return `Hello ${conn.remoteUser}!`;
});

BB.serve(app);
