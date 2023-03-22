"use strict";

/**
 * The app ID for accessing the live TriMet APIs.
 *
 * It is not necessary, or even particularly helpful, to hide this constant
 * since it is placed directly in the GET query string of all of TriMet's APIs,
 * and therefore it is trivially findable by anyone with the network inspect
 * tool included in every major browser. In fact, it is far easier to use that
 * tool than to search for the key in the JavaScript code.
 */
var APP_ID = "DB9C2B0467902CB970AD9CD6B";

/**
 * Given a base URL and a set of key-value pairs, returns a new URL made of the
 * base URL and a query string containing the app ID and the provided key-value
 * pairs. This results in a URL suitable for accessing live TriMet data.
 *
 * @param url    The URL to add the query string to. It must not already have a
 *               query string.
 * @param params (optional) The set of key-value pairs to add to the query
 *               string besides the app ID. If omitted, no other params are
 *               attached.
 * @return The new URL.
 */
function makeAppUrl(url, params) {
	const fullParams = Object.assign({}, {appID: APP_ID}, params);
	return url + "?" + $.param(fullParams);
}

/**
 * Defines an error that can be thrown from or returned in the error callback
 * for fetchData() and associated functions.
 *
 * @prop url     The URL that caused the error.
 * @prop message A summary of the fetching/HTTP error and/or parsing error.
 */
class FetchError extends Error {
	constructor(url, message) {
		super(`${url}: ${message}`);

		this.name = "FetchError";
		this.url = url;
	}
}

/**
 * Defines an error that occurs when a fetch times out.
 *
 * @prop url     The URL that timed out.
 * @prop message A simple message explaining that the connection timed out.
 */
class TimeoutError extends FetchError {
	constructor(url) {
		super(url, `${url}: Request timed out`);

		this.name = "TimeoutError";
		this.url = url;
	}
}

/**
 * Fetches a file from an external URL and returns a promise. Alternatively,
 * callback function for success and error can be used instead of the promise.
 * If these are provided, the promise will never resolve or reject.
 *
 * The data can be interpreted as text, JSON, or XML.
 *
 * Also see fetchText(), fetchJson(), and fetchXml() for function alternatives
 * with simpler call signatures.
 *
 * @param url       The URL to fetch the text file from.
 * @param dataType  Determines how to interpret the fetched data. Can be either
 *                  "text" for a string, "json" for a JavaScript object, or
 *                  "xml" for a XML document tree.
 * @param onSuccess (optional) The function to call on success. The fetched
 *                  string/object will be passed as the sole argument.
 * @param onError   (optional) The function to call on error. The exception
 *                  will be passed as the sole argument.
 *
 * @throws FetchError or TimeoutError if the promise rejected. No errors are
 *         thrown if callbacks are used.
 */
function fetchData(url, dataType, onSuccess, onError) {
	return new Promise((resolve, reject) => {
		$.ajax({
			// Fetch the URL as a raw text file with a two second timeout to
			// avoid waiting forever.
			url: url,
			dataType: dataType,
			timeout: 2000,

			// On success, pass the text directly to the success handler.
			success: (data, statusCode, xhr) => {
				if (onSuccess) {
					onSuccess(data);
				} else {
					resolve(data);
				}
			},

			// On error, call the error handler with error information combined
			// into a single string, namely the URL, status summary, and status
			// code.
			error: (xhr, category, code) => {
				code = code || "unknown";

				let error;
				if (category === "timeout") {
					error = new TimeoutError(url);
				} else {
					error = new FetchError(url, `(${category}) ${code}`);
				}

				if (onError) {
					onError(error);
				} else {
					reject(error);
				}
			},
		});
	});
}

/**
 * Fetches text from an external URL. It is identical to fetchData() with a
 * dataType of "text".
 */
function fetchText(url, onSuccess, onError) {
	return fetchData(url, "text", onSuccess, onError);
}

/**
 * Fetches JSON from an external URL. It is identical to fetchData() with a
 * dataType of "text".
 */
function fetchJson(url, onSuccess, onError) {
	return fetchData(url, "json", onSuccess, onError);
}

/**
 * Fetches XML from an external URL. It is identical to fetchData() with a
 * dataType of "xml".
 */
function fetchXml(url, onSuccess, onError) {
	return fetchData(url, "xml", onSuccess, onError);
}

/**
 * Fetches JSON from a TriMet live data service. It is identical to fetchData()
 * with a url of `makeAppUrl(url, params)`.
 */
function fetchAppData(url, params, type, onSuccess, onError) {
	return fetchData(makeAppUrl(url, params), type, onSuccess, onError);
}

/**
 * Fetches JSON from a TriMet live data service. It is identical to fetchJson()
 * with a url of `makeAppUrl(url, params)`.
 */
function fetchAppJson(url, params, onSuccess, onError) {
	return fetchJson(makeAppUrl(url, params), onSuccess, onError);
}

/**
 * Fetches XML from a TriMet live data service. It is identical to fetchXml()
 * with a url of `makeAppUrl(url, params)`.
 */
function fetchAppXml(url, params, onSuccess, onError) {
	return fetchXml(makeAppUrl(url, params), onSuccess, onError);
}

var RETRY_FETCH = 1000 * 2;
var FAST_FETCH = 1000;
var SLOW_FETCH = 1000 * 60;

class Fetcher {
	constructor(fetcher) {
		this.fetcher = fetcher;
		this.value = null;

		this.pendingTimeout = null;

		this.firstEvent = true;
		this.events = {
			first: [],
			fetch: []
		};
	}

	on(name, event) {
		this.events[name].push(event);
		return this;
	}

	single() {
		this.cancel();
		this._queueFetch(0, -1, true);
		return this;
	}

	interval(time) {
		this.cancel();
		this._queueFetch(0, time, true);
		return this;
	}

	cancel() {
		if (this.pendingTimeout !== null) {
			window.clearTimeout(this.pendingTimeout);
			this.pendingTimeout = null;
		}
	}

	async _callFetcher(interval) {
		try {
			this.value = await this.fetcher();

			if (this.firstEvent) {
				this._callEvents("first");
				this.firstEvent = false;
			}
			this._callEvents("fetch");

			if (interval >= 0) {
				this._queueFetch(interval, interval);
			} else {
				this.pendingTimeout = null;
			}
		} catch (err) {
			if (err instanceof FetchError) {
				// TODO: Display message bar with error
			} else {
				throw err;
			}

			console.warn(err.message);

			this._queueFetch(RETRY_FETCH, interval);
		}
	}

	_queueFetch(wait, interval, force = false) {
		if (force || this.pendingTimeout !== null) {
			this.pendingTimeout = window.setTimeout(() => {
				this._callFetcher(interval);
			}, wait);
		}
	}

	_callEvents(name) {
		for (event of this.events[name]) {
			event(this.value);
		}
	}
}
