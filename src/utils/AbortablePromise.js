const Promise = require("bluebird");
const R = require("ramda");

function makeAbortable(promise, abort) {
    promise.abort = abort;

  // Hijack promise.then so it returns an abortable promise.
    const _then = promise.then;
    promise.then = function (...args) {
        return makeAbortable(Reflect.apply(_then, promise, args), abort);
    };

    return promise;
}

/**
 * A Promise class with an abort() method that calls the onAbort function
 * provided by the resolver.
 *
 * Example:
 *
 *   let promise = new AbortablePromise(function (resolve, reject, onAbort) {
 *     // Use resolve & reject as you normally would.
 *     let request = makeRequest( ... , function (error, response) {
 *       if (error) {
 *         reject(error);
 *       } else {
 *         resolve(response);
 *       }
 *     });
 *
 *     // Use onAbort to register a promise.abort() function. It is the
 *     // responsibility of this function to abort the execution of the
 *     // promise and resolve/reject as needed.
 *     onAbort(function () {
 *       request.abort();
 *       reject(new Error('Request was aborted'));
 *     });
 *   });
 *
 *   promise.abort(); // Calls the onAbort handler.
 */
function AbortablePromise(resolver) {
    if (!R.is(Function, resolver)) {
        throw new Error("AbortablePromise needs a resolver function");
    }

    let abort;
    const promise = new Promise(function (resolve, reject) {
        let aborter;

        abort = function (...args) {
            if (R.isNil(aborter)) {
                return;
            }

            const fn = aborter;
            aborter = null;

            try {
                return Reflect.apply(fn, this, args);
            } catch (error) {
                reject(error);
            }
        };

        resolver(function (...args) {
            const [child] = args;
            if (child && R.is(Function, child.abort)) {
                aborter = child.abort;
            } else {
                aborter = null;
            }

            Reflect.apply(resolve, this, args);
        }, function (...args) {
            aborter = null;
            Reflect.apply(reject, this, args);
        }, function (fn) {
            if (!R.is(Function, fn)) {
                throw new Error("onAbort needs a function");
            }

            aborter = fn;
        });
    });

    return makeAbortable(promise, abort);
}

module.exports = AbortablePromise;
