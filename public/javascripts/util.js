"use strict";

/**
 * Checks whether a condition is true and throws an error if not.
 *
 * @param cond    The condition to assert.
 * @param message (optional) The message to provide to the error.
 */
function assert(cond, message = "assert() called") {
	if (!cond) {
		throw new Error(message);
	}
}

/**
 * A simpler variant of assert() that does not check a condition, but
 * unconditionally throws an error.
 *
 * @param message (optional) The message to provide to the error.
 */
function fail(message = "fail() called") {
	throw new Error(message);
}

/**
 * Alternative to window.setTimeout() that uses promises, making it ideal for
 * use in asynchronous functions. For example:
 *
 *     async function myFunc() {
 *         // Do some stuff
 *
 *         // Wait for two seconds
 *         await delay(2000);
 *
 *         // Do some more stuff
 *     }
 *
 * @param time  The time in milliseconds to delay for. Defaults to 0, in which
 *              case the promise will resolve on the next event cycle.
 * @param value (optional) The value that the promise will resolve to. If not
 *              provided, the promise will resolve to undefined.
 * @return A promise that will resolve to the specified value after the given
 *         amount of time.
 */
function delay(time = 0, value) {
	return new Promise((resolve, reject) => {
		window.setTimeout(resolve, time, value);
	});
}
