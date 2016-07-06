const d = require("describe-property");
const makeToken = require("../../utils/makeToken");
const Promise = require("../../utils/Promise");

const {forEach, keys} = require("ramda");

function makeUniqueKey(sessions, keyLength) {
    let key;
    do {
        key = makeToken(keyLength);
    } while (sessions[key]);

    return key;
}

function pruneStore(store, interval) {
    const timer = setInterval(function () {
        const now = Date.now();

        let session;
        forEach(function (key) {
            session = store.sessions[key];

            if (session._expiry && session._expiry < now) {
                store.purge(key);
            }
        }, keys(store.sessions));
    }, interval);

  // Don't let this timer keep the event loop running.
    timer.unref();

    return timer;
}

/**
 * Basic server-side storage for sessions that exist within a single process.
 * This should never be used in production, but can be useful in development
 * and testing scenarios when there is only a single server instance.
 *
 * Accepts the following options:
 *
 * - keyLength        The length (in bytes) that will be used for unique cache keys.
 *                    Defaults to 32
 * - purgeInterval    The interval (in milliseconds) at which the cache is
 *                    purged of expired sessions. Defaults to 5000
 * - expireAfter      The number of seconds after which sessions expire.
 *                    Defaults to 0 (no expiration)
 */
function MemoryStore(options) {
    options = options || {};

    this.sessions = {};
    this.timer = pruneStore(this, options.purgeInterval || 5000);
    this.keyLength = options.keyLength || 32;
    this.ttl = options.expireAfter
    ? 1000 * options.expireAfter // expireAfter is given in seconds
    : 0;
}

Object.defineProperties(MemoryStore.prototype, {

    load: d(function (value) {
        const session = this.sessions[value];

        if (!session) {
            return Promise.resolve({});
        }

    // Verify the session is not expired.
        if (session._expiry && session._expiry <= Date.now()) {
            return Promise.resolve({});
        }

        return Promise.resolve(session);
    }),

    save: d(function (session) {
        let key = session._id;
        if (!key) {
            key = session._id = makeUniqueKey(this.sessions, this.keyLength);
        }

        if (this.ttl) {
            session._expiry = Date.now() + this.ttl;
        }

        this.sessions[key] = session;

        return Promise.resolve(key);
    }),

    purge: d(function (key) {
        if (key) {
            delete this.sessions[key];
        } else {
            this.sessions = {};
        }
    }),

    destroy: d(function () {
        delete this.sessions;

        if (this.timer) {
            clearInterval(this.timer);
            delete this.timer;
        }
    })

});

module.exports = MemoryStore;
