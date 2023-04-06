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
	const fullParams = Object.assign({appID: APP_ID}, params);
	return url + "?" + $.param(fullParams);
}

/** Time in seconds defining how long fetchData() will wait after a failed
 * fetch before trying again. Defined as two seconds. */
var RETRY_FETCH = 1000 * 2;

/** Time in seconds before a fetch will timeout. Defined as ten seconds because
 * anything longer than that will result in an unusably slow fetch. */
var FETCH_TIMEOUT = 1000 * 10;

/** Function hook that is called by `fetchData()` on successful fetch. */
var onFetchSuccess = () => {};
/** Function hook that is called by `fetchData()` each time on failure. */
var onFetchFailure = (err) => {};

/**
 * Fetches a file from an external URL and returns a promise, parsing the data
 * as text, JSON, or XML. Optionally, if the fetch fails or times out, this
 * function can wait and retry the fetch again until the fetch succeeds.
 *
 * See fetchText(), fetchJson(), and fetchXml() for function alternatives with
 * simpler call signatures. Also see fetchAppJson() and fetchAppXml() for
 * variants that use makeAppUrl().
 *
 * @param url       The URL to fetch the data from.
 * @param dataType  Determines how to interpret the fetched data. Can be either
 *                  "text" for a string, "json" for a JavaScript object, or
 *                  "xml" for an XML document tree.
 * @param retry     (optional) If true, the fetch will be retried on error
 *                  until success. If false, an error object is thrown.
 *                  Defaults to true.
 * @return A promise that resolves to the data being fetched. If the fetch can
 *         never succeed, the function will never return.
 * @throws If `retry` is false and the fetch fails, an object containing two
 *         string values, `category` and `code` for jQuery category and HTTP
 *         status respectively, will be thrown.
 */
async function fetchData(url, dataType, retry = true) {
	// Enter an indefinite loop to repeatedly attempt to fetch the data until
	// we succeed.
	while (true) {
		try {
			// Asynchronously await the actual fetch using a promise wrapper
			// around jQuery's callback-based AJAX API
			let data = await fetchPromise(url, dataType);

			// If we succeeded without throwing an error, call the success hook
			// and return the data.
			onFetchSuccess();
			return data;
		} catch (err) {
			// If the fetch failed and the promise rejected, catch that error
			// and handle it. Regardless of whether we retry the fetch or not,
			// display the error message bar.
			onFetchFailure(err);

			if (retry) {
				// If we want to retry the fetch, just log a warning about the
				// failed fetch and continue on.
				console.warn(`fetchData("${url}", "${dataType}"): ` +
					`(${err.category}) ${err.code}`);
			} else {
				// If we don't want to retry, just propagate the error.
				throw err;
			}
		}

		// If we reach this point in the code, we are retrying after a failed
		// fetch. Wait for a bit before repeating the loop.
		await delay(RETRY_FETCH);
	}
}

/**
 * Internal helper function for fetchData(); calls jQuery's AJAX API with the
 * specified URL and data type and returns a promise that will resolve or
 * reject based on the result of that call.
 *
 * @param url      The URL to fetch the data from.
 * @param dataType The data type to instruct jQuery to interpret the data as.
 * @return A promise that will resolve when jQuery's AJAX callbacks run.
 */
function fetchPromise(url, dataType) {
	return new Promise((resolve, reject) => {
		$.ajax({
    
			// Provide the URL and data type verbatim. We also provide
			// a timeout so the fetch doesn't try to resolve for
			// inordinately long amounts of time.
			url: url,
			dataType: dataType,
			timeout: FETCH_TIMEOUT,

			// On success, simply resolve the promise.
			success: (data, statusCode, xhr) => {
				resolve(data);
			},

			// On error, reject the promise with an error message
			// object containing information about the error.
			error: (xhr, category, code) => {
				reject({
					category: category,
					code: code || "unknown",
				});
			},
		});
	})
}

/**
 * Fetches text from an external URL. It is identical to fetchData() with a
 * dataType of "text".
 */
function fetchText(url, retry) {
	return fetchData(url, "text", retry);
}

/**
 * Fetches JSON from an external URL. It is identical to fetchData() with a
 * dataType of "text".
 */
function fetchJson(url, retry) {
	return fetchData(url, "json", retry);
}

/**
 * Fetches XML from an external URL. It is identical to fetchData() with a
 * dataType of "xml".
 */
function fetchXml(url, retry) {
	return fetchData(url, "xml", retry);
}

/**
 * Fetches JSON from a TriMet live data service. It is identical to fetchJson()
 * with a url of `makeAppUrl(url, params)`.
 */
function fetchAppJson(url, params, retry) {
	return fetchJson(makeAppUrl(url, params), retry);
}

/**
 * Fetches XML from a TriMet live data service. It is identical to fetchXml()
 * with a url of `makeAppUrl(url, params)`.
 */
function fetchAppXml(url, params, retry) {
	return fetchXml(makeAppUrl(url, params), retry);
}
