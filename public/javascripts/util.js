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
