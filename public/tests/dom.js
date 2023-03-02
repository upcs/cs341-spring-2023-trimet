/* This file is a wrapper for loading an HTML file or some scripts into JSDOM
 * for testing via Jest. Each function takes some argument pointing to HTML or
 * some script files and loads it into JSDOM, returning a reference to the
 * global window object of the mocked up web browser.
 *
 * For example, function examples for loading local HTML or JavaScript files:
 *
 *     dom.loadFile("public/index.html");
 *     dom.loadUrl("https://localhost:3000");
 *     dom.loadHtml("<script src='javascripts/fetch.js'></script>", "public");
 *     dom.loadScript("javascripts/fetch.js");
 *     dom.loadScripts(["fetch.js", "interaction.js"], "public/javascripts");
 *
 * Inside a test, that might look like this (assuming `dom.js` is in the
 * `tests` directory):
 *
 *     const dom = require("./dom.js");
 *
 *     test("Document body has exactly one element", async () => {
 *         const window = await dom.loadFile("public/index.html");
 *         expect(window.document.body.children.length).toEqual(1);
 *     });
 *
 * Note that the testing function must be async and the function to retrieve
 * the window must be await'ed. Then, all web browser functionality, including
 * variables which are usually global, is available through the window object.
 */

const jsdom = require("jsdom");
const path = require("path");

/**
 * Since JavaScript files don't load immediately in JSDOM, we have to wait for
 * them to load. But, we need this to load before the tests can run. So, we
 * install an event listener for the onload event and await its completion, and
 * then this function returns.
 *
 * @param window The window received from the JSDOM constructor.
 */
async function waitForLoad(window) {
	let onLoadPromise = new Promise((resolve, reject) => {
		window.addEventListener("load", resolve);
	});
	await onLoadPromise;
}

/**
 * Loads a JSDOM instance from an HTML string.
 *
 * Since the HTML file will have no url by default, making it impossible to
 * load external scripts, an optional path can also be provided. The final url
 * for the HTML will be `file://<path to Node directory>/<loadPath>/test.html`.
 *
 * @param html     The HTML string to load into the DOM.
 * @param loadPath The path to the imaginary HTML file. Defaults to "public".
 * @return The window object of the DOM.
 */
exports.loadHtml = async function(html, loadPath = "public") {
	const fullPath = "file://" + path.join(path.resolve(loadPath), "test.html");

	const {window} = new jsdom.JSDOM(html, {
		url: fullPath,
		resources: "usable",
		runScripts: "dangerously"
	});

	await waitForLoad(window);
	return window;
}

/**
 * Loads a JSDOM instance from a local HTML file.
 *
 * @param file The path to the HTML file to load.
 * @return The window object of the DOM.
 */
exports.loadFile = async function(file) {
	const {window} = await jsdom.JSDOM.fromFile(file, {
		resources: "usable",
		runScripts: "dangerously"
	});

	await waitForLoad(window);
	return window;
}

/**
 * Loads a JSDOM instance from a remote HTML file given by a URL. Using this,
 * it is possible to start the actual code via `npm start` before testing and
 * have tests run files from `http://localhost:3000`.
 *
 * Warning: Scripts contained in this URL will be run, possibly giving them
 * access to the Node.js instance. Do not use untrusted URLs as this could pose
 * a security risk!
 *
 * @param url The URL to load from.
 * @return The window object of the DOM.
 */
exports.loadUrl = async function(url) {
	const {window} = await jsdom.JSDOM.fromURL(url, {
		resources: "usable",
		runScripts: "dangerously"
	});

	await waitForLoad(window);
	return window;
}

/**
 * Loads a JSDOM instance from a set of script files. These script files will
 * be placed in an HTML string that contains the scripts in the head of the
 * HTML, but contains nothing else.
 *
 * This internally calls loadHtml(), so the same information about `loadPath`
 * applies.
 *
 * @param scripts  An array of scripts to load in the head of the HTML.
 * @param loadPath The path to the imaginary HTML file. Defaults to "public".
 * @return The window object of the DOM.
 */
exports.loadScripts = async function(scripts, loadPath = "public") {
	let html = "<!doctype html><html><head>";
	for (script of scripts) {
		html += `<script src="${script}"></script>`;
	}
	html += "</head><body></body></html>"

	return exports.loadHtml(html, loadPath);
}

/**
 * A convenience wrapper for loadScripts() that loads only a single script
 * instead of an array of scripts.
 *
 * @param script   The script to load in the head of the HTML.
 * @param loadPath The path to the imaginary HTML file. Defaults to "public".
 * @return The window object of the DOM.
 */
exports.loadScript = async function(script, loadPath = "public") {
	return exports.loadScripts([script], loadPath);
}
