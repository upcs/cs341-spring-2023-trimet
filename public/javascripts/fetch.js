"use strict";

// The app ID for accessing the live TriMet APIs. There's no point in hiding
// this constant since it's placed directly in the GET query string, and
// therefore is available for anyone to see.
const APP_ID = "DB9C2B0467902CB970AD9CD6B";

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
 * Fetches a file from an external URL, calling functions for success or error.
 * The data can be interpreted as either text or JSON.
 *
 * Also see fetchText() and fetchJson() for function alternatives with simpler
 * call signatures.
 *
 * @param url       The URL to fetch the text file from.
 * @param dataType  Determines how to interpret the fetched data. Can be either
 *                  "text" for a string, "json" for a JavaScript object, or
 *                  "xml" for a XML document tree.
 * @param onSuccess The function to call on success. The fetched string/object
 *                  will be passed as the sole argument.
 * @param onError   The function to call on error. The error status will be
 *                  passed as the sole argument.
 */
function fetchData(url, dataType, onSuccess, onError) {
	$.ajax({
		// Fetch the URL as a raw text file with a two second timeout to avoid
		// waiting forever.
		url: url,
		dataType: dataType,
		timeout: 2000,

		// On success, pass the text directly to the success handler.
		success: (data, statusCode, xhr) => {
			onSuccess(data);
		},

		// On error, call the error handler with error information combined
		// into a single string, namely the URL, status summary, and status
		// code.
		error: (xhr, textStatus, statusCode) => {
			onError(`Fetch "${url}" (${textStatus}) ${statusCode}`);
		},
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

// source: https://www.w3schools.com/xml/ajax_applications.asp
// printRedTable is identical, just for red line.
function printBlueTable() {
	//Grabs data from routeConfig, which "Retrieves a list of routes being reported by TransitTracker from the active schedule"
	//Currently shows stops and direction it's going
	fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {stops: true, dir: true}, function(xml) {
		var i;
		var xmlDoc = xml.documentElement;
		//dir element stands for "direction"
		var dest = xmlDoc.getElementsByTagName("dir");
		//Shows data in 2 columns, and aligns proper stops with the direction its going in.
		var dest0Stops = dest[0].getElementsByTagName("stop");
		var dest1Stops = dest[1].getElementsByTagName("stop");
		var table = "<tr><th>" + dest[0].getAttribute("desc") + "</th><th>"
		+ dest[1].getAttribute("desc") + "</th></tr>";
		//Shows the Stops for the respective destination.
		for (i = 0; i < dest0Stops.length; i++) {
			table += "<tr><td>" + dest0Stops[i].getAttribute("desc") + "</td>";
			table += "<td>" + dest1Stops[i].getAttribute("desc") + "</td></tr>";

		}
		//updates the table
		document.getElementById("lineTable").innerHTML = table;
		//Simply throws an error msg in the log is there's something wrong.
	}, function(status) {
    	console.log("We got an error: " + status);
	});	
}

function  printRedTable() {
	fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {stops: true, dir: true}, function(xml) {
		var i;
		var xmlDoc = xml.documentElement;
		var dest = xmlDoc.getElementsByTagName("dir");
		var dest2Stops = dest[2].getElementsByTagName("stop");
		var dest3Stops = dest[3].getElementsByTagName("stop");
		var table = "<tr><th>" + dest[2].getAttribute("desc") + "</th><th>"
		+ dest[3].getAttribute("desc") + "</th></tr>";

	for (i = 0; i < dest2Stops.length; i++) {
			table += "<tr><td>" + dest2Stops[i].getAttribute("desc") + "</td>";
			table += "<td>" + dest3Stops[i].getAttribute("desc") + "</td></tr>";

		}

		document.getElementById("lineTable").innerHTML = table;

	}, function(status) {
		console.log("We got an error: " + status);
	});	
}

//Interacts with minimize/show button. Changes text on button and either hids or shows.
//Must work on this to be exactly what group wants. ASK THE GROUP.
function hideLineTable() {
	//var last = $.data(txtbox_1, "last");
	if ($('#minimizeBtn').text() == "Minimize Table"){	
		$("#minimizeBtn").text("Show Table");
		$("#lineTable").hide();
	}
	else{
		$("#minimizeBtn").text("Minimize Table");
		$("#lineTable").show();
	}
}