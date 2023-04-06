"use strict";

// Create a non-user interactable tab list for the stops sidebar: one page for
// the stops list, and one page for the routes associated with the stop.
var stopPages = new TabList("stops-pages", false)
	.showTab("stops");

// Create a tab list for the routes associate with a given stop.
var transportTabs = new TabList("transport-type");

/**
 * Updates the list of routes that go through a given stop and creates/ shows the list
 * in a new tab list.
 *
 * @param stopNode The XML node from the stopTransports XML to be compared with 
 *                  XML nodes from transportRoutes in order to find routes that 
 * 					go through a given stop.
 */
function updateTransport(stopNode) {
	let xml = staticFetch.data.transportRoutes;

	//Displays the tab with the lists of routes.
	transportTabs.showTab("transport-0");

	// Hides and empties lists for the time being
	$("#transport-selector").hide().text("");
	$("#transport-0-list").empty();

	// Update the text for the stop we chose.
	$("#transport-chosen").text(stopNode.getElementsByTagName("name")[0].textContent);

	// Loop over the directions we have as children, which may be one or two.
	for (let transportNode of xml.documentElement.children) {
		for (let transportStop of transportNode.children) {
			//Hides the top selector button as it is not necessary anymore.
			$("#transport-selector").hide();

			// Get the list used to store the routes
			let transportElem = $("#transport-0-list").scrollTop(0);

			// Looks at every stop in a given direction for a given route. 
			// If the stop passed in (stopNode) is within a given route. Adds the
			// route to the list with the given direction. 
			for (let routeNode of transportStop.children) {
				if ((routeNode.getAttribute("desc")) == (stopNode.getElementsByTagName("name")[0].textContent)) {
					let buttonElem = $("<button>").text(transportNode.getAttribute("desc") 
						+ " -- " + routeNode.getAttribute("dir"));	
					transportElem.append(buttonElem);
				}
			}
		}
	}
}

/**
 * Updates which stop buttons are shown or hidden based on the current search
 * terms that are listed in the search bar.
 */
function updateStopSearch() {
	let stopsElem = $("#stops-list");

	// Get our search term with case insensitivity and ignoring leading or
	// trailing whitespace.
	let searchTerm = $("#stops-search").val().trim().toLowerCase();

	// Loop over all the buttons in our stops and decide which ones to show
	// and hide.
	for (let buttonElem of stopsElem.children()) {
		// Get the button stop name, also case insensitive.
		buttonElem = $(buttonElem);
		let stopName = buttonElem.text().toLowerCase();

		// If the button's stop name includes the search term, show this
		// button in case it was hidden before. Otherwise, hide this button.
		if (stopName.includes(searchTerm)) {
			buttonElem.show();
		} else {
			buttonElem.hide();
		}
	}
}

/**
 * Updates the list of stops displayed in the sidebar in accord with the
 * stopTransports XML file fetched from TriMet's servers and goes on to hide
 * all available stops until a search is entered.
 */
function updateStops() {
	let xml = staticFetch.data.stopTransports;

	// Get and clear out our current list of routes.
	let stopsElem = $("#stops-list").empty();

	// Loop over all the stops of the root of the XML document and add
	// buttons for each of them.
	for (let stopNode of xml.documentElement.getElementsByTagName("Placemark")) {
		let buttonElem = $("<button>")
			.text(stopNode.getElementsByTagName("name")[0].textContent)
			.on("click", e => {
				// When the button is clicked, show the routes that go through that stop.
				stopPages.showTab("transport");
				updateTransport(stopNode);
			});

		stopsElem.append(buttonElem);
	}

	//After creating all button elements, hides the list in order to prevent wait time issues.
	stopsElem.hide();

	// Since the list of buttons was changed, also re-update which ones are
	// shown due to the search bar.
	updateStopSearch();
}

// When the search bar is edited and enter is clicked, updates stop list with relevant
// stops based on search entered.
$("#stops-search").keyup(function(e) {
	if (e.keyCode == 13) {
		$("#stops-list").show();
		updateStopSearch();
	}
});

// Clear and refocus the search field when clicking the X button, also 
// hides all stop buttons again for wait times. 
$("#stops-clear-search").on("click", e => {
	$("#stops-search").val("").focus();
	//Hides the list of stops again if there is no search input to prevent 
	//incredibly long list / wait times.
	$("#stops-list").hide();
	updateStopSearch();
});

// Goes back to the list of stops found from the given search
$("#transport-back").on("click", e => {
	stopPages.showTab("stops");
});

/* Fetches every possible route and the route's stops from TriMet and 
 * stores it within the "transportRoutes" variable in order to prevent 
 * fetching from happening everytime a search is made. 
 */
staticFetch.addData("transportRoutes",
	() => fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {
		stops: true,
		dir: true,
	})
);

/* Fetches every possible stop from TriMet and stores it within the "stopTransports" variable 
 * in order to prevent fetching from happening everytime a search is made. 
 */
staticFetch.addData("stopTransports",
	() => fetchAppXml("https://developer.trimet.org/gis/data/tm_stops.kml", {
		ll: true,
	})
);


// After fetching data, calls stops in order to create a list of all possible stops.
staticFetch.onFetch(data => {
	updateStops();
});