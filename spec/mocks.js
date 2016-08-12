const R = require("ramda");
const EventEmitter = require("events");

const emitter = (buffers) => {
    const emitter = new EventEmitter();
    const emit = (buffer) => emitter.emit("data", buffer);
    let registered = [];
    emitter.on("newListener", (event) => {
        // Wait until listeners have been registered for all of the data events, then go
        registered = R.append(event, registered);
        if (R.equals(registered, ["data", "end", "error"])) {
            R.forEach(emit, buffers);
            emitter.emit("end");
        }
    });
    return emitter;
};

module.exports = {emitter};
