/**
 * A class that manages fetching data once and over intervals of time.
 *
 * The primary way to use this class is to register data to be fetched and
 * callbacks to run when that data has been fetched. For instance, this
 * instructs a fetcher to fetch routes from a specific URL and place it in the
 * field named "routeStops":
 *
 *     staticFetch.addData("routeStops",
 *         () => fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {
 *             stops: true,
 *             dir: true,
 *         })
 *     );
 *
 * To retrieve this field later from `staticFetch`, simply use:
 *
 *     staticFetch.data.routeStops
 *
 * When the data is fetched, the manager will run all callbacks associated with
 * it. Depending on the manager, it may repeatedly fetch data, in which case
 * the callbacks are called each time. To register a callback:
 *
 *     staticFetch.onFetch(data => {
 *         // `data` is a shortcut to `staticFetch.data` here.
 *         console.log(data.routeStops);
 *     });
 *
 * There are three standard FetchManagers: `staticFetch`, `slowFetch`, and
 * `fastFetch`. Refer to their documentation for details.
 *
 * @prop data   The current data loaded from the fetches registered with
 *              addData(). Each field will be null until the first fetch.
 * @prop loaded A member that is true iff data has been fetched at least once.
 */
class FetchManager {
	/**
	 * Construct a new FetchManager for which callbacks can be registered. The
	 * FetchManager will begin fetching data when the jQuery
	 * `$(document).ready()` function is fired, i.e. after all JavaScript files
	 * have loaded.
	 *
	 * @param interval (optional) If non-zero, the data will be fetched
	 *                 repeatedly over this interval of time. Defaults to zero.
	 */
	constructor(interval = 0) {
		this.data = {};
		this.loaded = false;

		this.names = [];
		this.producers = [];
		this.callbacks = [];

		// After the JavaScript files have loaded, start running the fetches,
		// either once or over an interval, depending on the parameter.
		$(document).ready(() => {
			if (interval === 0) {
				this.runOnce();
			} else {
				this.runLoop(interval);
			}
		});
	}

	/**
	 * Registers a new data field to be fetched by the given producer function
	 * that returns fetch promises.
	 *
	 * @param key      The field to store the fetched data in.
	 * @param producer A function that takes no arguments and returns a new
	 *                 fetch promise when called.
	 */
	addData(key, producer) {
		this.data[key] = null;

		this.names.push(key);
		this.producers.push(producer);
	}

	/**
	 * Registers a new callback to be called whenever all registered data has
	 * finished fetching. If data is fetched over an interval, this is called
	 * every time the data finishes fetching.
	 *
	 * @param callback The function to be called on fetch. A reference to the
	 *                 `data` property will be passed to the callback.
	 */
	onFetch(callback) {
		this.callbacks.push(callback);
	}

	/**
	 * Internal method: Asynchronously starts a new fetch from all producers,
	 * sets these into their respective fields in `data`, and calls all
	 * callbacks.
	 */
	async runOnce() {
		// Call all the fetch producers and simultaneously wait for each of the
		// promises they resolve to.
		let promises = this.producers.map(p => p());
		let resolved = await Promise.all(promises);

		// Set the resolved data into the appropiate fields in `data`.
		for (let i = 0; i < this.names.length; i++) {
			this.data[this.names[i]] = resolved[i];
		}

		// The data has now been loaded for at least the first time, so set the
		// `loaded` property to true.
		this.loaded = true;

		// Call all registered fetch callbacks.
		this.callbacks.forEach(c => c(this.data));
	}

	/**
	 * Internal method: Loops infinitely, calling runOnce() and waiting the
	 * specified interval of time after it completes before calling it again.
	 *
	 * @param interval The interval of time to wait between fetches.
	 */
	async runLoop(interval) {
		while (true) {
			await this.runOnce();
			await delay(interval);
		}
	}
}

/**
 * FetchManager that fetches static data only once while the page is loading.
 * This is primarily data that hardly ever changes, such as bus routes.
 */
let staticFetch = new FetchManager();

/**
 * FetchManager that slowly but repeatedly fetches data every five minutes.
 * This should be used for data that can change while the app is running, but
 * only infrequently, such as service alerts.
 */
let slowFetch = new FetchManager(1000 * 60 * 5);

/**
 * FetchManager that quickly and repeatedly fetches data about every three
 * seconds, depending on network speed. This should be used for data that needs
 * to be updated while the user is using the page, such as bus locations.
 */
let fastFetch = new FetchManager(1000 * 3);
