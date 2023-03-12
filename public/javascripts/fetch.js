"use strict";

// The app ID for accessing the live TriMet APIs. There's no point in hiding
// this constant since it's placed directly in the GET query string, and
// therefore is available for anyone to see.
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
 * Fetches a file from an external URL and returns a promise. For the time
 * being, callback functions for success and error are also called for
 * resolving and rejecting of the promise, respectively. If these are provided,
 * the promise will never resolve or reject.
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
 * @param onError   (optional) The function to call on error. The error status
 *                  will be passed as the sole argument.
 */
function fetchData(url, dataType, onSuccess, onError) {
	return new Promise((resolve, reject) => {
		$.ajax({
			// Fetch the URL as a raw text file with a two second timeout to avoid
			// waiting forever.
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
			error: (xhr, textStatus, statusCode) => {
				const error = `Fetch "${url}" (${textStatus}) ${statusCode}`;

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

/**
 * source: https://www.w3schools.com/xml/ajax_applications.asp
 * 
 * Gets destinations (as well as each stop on the way) for the provided bus or MAX line using the function to fetch xml data from
 * the trimet database
 * 
 * @param busName Name of bus or MAX line that is to be fetched.
 * 
 * SIDE NOTE: Method currently puts data into a table format and prints it into the schedule div box. This will most likely be changed
 * in the future in order to better display data based on clicks from the map.
 */

function fetchStops(busName) {
	fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {stops: true, dir: true}, function(xml) {
		var i, k, highestStops, busNum;
		var xmlDoc = xml.documentElement;
		var buses = xmlDoc.getElementsByTagName("route");

		//Goes through all available bus lines/ MAX rails in order to find data for given bus/MAX line
		for (i = 0; i < buses.length; i++) {
			if (buses[i].getAttribute("desc") == busName) {
				busNum = i;
			}
		} 
		var destinations = buses[busNum].getElementsByTagName("dir");

		var table = "<tr><th>" + destinations[0].getAttribute("desc") + "</th><th>" +
		destinations[1].getAttribute("desc") + "</th></tr>";

		

		//Only 2 destinations for each of the busses/ MAX lines which is reason for hard coded 0 and 1 destinations
		var dest0Stops = destinations[0].getElementsByTagName("stop");
		var dest1Stops = destinations[1].getElementsByTagName("stop");

		//Makes sure all stops are iterated through incase 1 destinations amount of stops is lower than another
		if (dest0Stops.length >= dest1Stops.length) {
			highestStops = dest0Stops.length;
		}
		else {
			highestStops = dest1Stops.length;
		}

		for (k = 0; k < highestStops; k++) {
			//If k exceeds the amount of stops for a certain destination, prints an empty square in the table to prevent
			//an out of bounds error.
			if ((dest0Stops.length - 1) < k) {
				table += "<tr><td>  </td>";
			}
			else {
				table += "<tr><td>" + dest0Stops[k].getAttribute("desc") + "</td>";
			}

			if ((dest1Stops.length - 1) < k) {
				table += "<td>  </td></tr>";
			}
			else {
				table += "<td>" + dest1Stops[k].getAttribute("desc") + "</td></tr>";
			}
		}

		document.getElementById("lineTable").innerHTML = table;
		$(this).hide();

	},
	function(status) {
		console.log("We got an error: " + status);
	});
}


/**
 * This function fetches all of the names of the routes that we need and displays them 
 * inside of a table in the left menu.
 */

function fetchNames() {
	fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {stops: true, dir: true}, function(xml) {
		var i, k, highestStops, busNum;
		var xmlDoc = xml.documentElement;
		var buses = xmlDoc.getElementsByTagName("route");
		var nameArr = [];

		//Fetches all of  the names
		for (i = 0; i < buses.length; i++) {
			nameArr[i] = buses[i].getAttribute("desc");
		} 
		var table;
		//Creates table
		for (k = 0; k < buses.length; k++) {
			table += "<tr><td>" + nameArr[k] + "</td>";		
		}
		document.getElementById("lineTable").innerHTML = table;
	},
	function(status) {
		console.log("We got an error: " + status);
	});

}