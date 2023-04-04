"use strict";

// Create a non-user interactable tab list for the routes sidebar: one page for
// the routes list, and one page for the directions.
var stopPages = new TabList("stops-pages", false)
	.showTab("stops");

// Create a tab list for the inbound and outbound direction tabs.
var transportTabs = new TabList("transport-type");

/**
 * Updates the list of stops in each direction displayed in the sidebar in
 * accord with a certain route.
 *
 * @param stopNode The XML node from the routeStops XML for the directions and
 *                  stops to display.
 */
function updateTransport(stopNode) {
	/*
	// When we show directions, always show the first tab.
	transportTabs.showTab("transport-0");

	// It's possible for a route to only have one direction, so hide both tabs
	// and empty their contents for now.
	$("#transport-0-selector, #transport-1-selector").hide().text("");
	$("#transport-0-list, #transport-1-list").empty();

	// Update the text for the route we chose.
	$("#transport-chosen").text(stopNode.getAttribute("desc"));

	// Loop over the directions we have as children, which may be one or two.
	for (let transportNode of stopNode.children) {
		let transport = transportNode.getAttribute("dir");

		// Reshow the selector for this direction and give it the right label.
		$("#transport-" + transport + "-selector")
			.show()
			.text(transportNode.getAttribute("desc"));

		// Get the list for this direction.
		let transportElem = $("#transport-" + transport + "-list").scrollTop(0);

		// Add all the stops that this direction has to the list.
		for (let timeNode of transportNode.children) {
			let buttonElem = $("<button>").text(timeNode.getAttribute("desc"));
			transportElem.append(buttonElem);
		}
	}
	*/
}

/**
 * Updates which route buttons are shown or hidden based on the current search
 * terms that are listed in the search bar.
 */
function updateStopSearch() {
	let stopsElem = $("#stops-list");

	// Get our search term with case insensitivity and ignoring leading or
	// trailing whitespace.
	let searchTerm = $("#stops-search").val().trim().toLowerCase();

	// Loop over all the buttons in our routes and decide which ones to show
	// and hide.
	for (let buttonElem of stopsElem.children()) {
		// Get the button route name, also case insensitive.
		buttonElem = $(buttonElem);
		let stopName = buttonElem.text().toLowerCase();

		// If the button's route name includes the search term, show this
		// button in case it was hidden before. Otherwise, hide this button.
		if (stopName.includes(searchTerm)) {
			buttonElem.show();
		} else {
			buttonElem.hide();
		}
	}
}

/**
 * Updates the list of routes displayed in the sidebar in accord with the
 * routeStops XML file fetched from TriMet's servers.
 */
function updateStops() {
	let xml = staticFetch.data.stopTransports;

	// Get and clear out our current list of routes.
	let stopsElem = $("#stops-list").empty();

	// Loop over all the route children of the root of the XML document and add
	// buttons for each of them.
	for (let stopNode of xml.documentElement.getElementsByTagName("Placemark")) {
		let buttonElem = $("<button>")
			.text(stopNode.getElementsByTagName("name")[0].textContent)
			.on("click", e => {
				// When the button is clicked, show the stops for that route.
				stopPages.showTab("transport");
				updateTransport(dataNode);
			});

		stopsElem.append(buttonElem);
	}

	// Since the list of buttons was changed, also re-update which ones are
	// shown due to the search bar.
	updateStopSearch();
}

// When the search bar is edited, update the list of routes.
$("#stops-search").on("input", e => {
	updateStopSearch();
});

// Clear and refocus the search field when clicking the X button, and update
// the list of routes.
$("#stops-clear-search").on("click", e => {
	$("#stops-search").val("").focus();
	updateStopSearch();
});

// Go back to the list of routes when the user clicks the back button.
$("#transport-back").on("click", e => {
	stopPages.showTab("stops");
});

// When the direction tabs are clicked, scroll the lists back to the top.
$("#transport-0-selector, #transport-1-selector").on("click", e => {
	$("#transport-0-list, #transport-1-list").scrollTop(0);
});

/* Fetch our list of routes with stops for the table as a static fetch. It's
 * possible, although highly improbably, for routes to change while the user is
 * using the app; however, it's too unlikely to bother about, so a page refresh
 * is required to see new routes.
 */
staticFetch.addData("stopTransports",
	() => fetchAppXml("https://developer.trimet.org/gis/data/tm_stops.kml", {
		ll: true,
	})
);

// Once we have our static data, update the routes in the table.
staticFetch.onFetch(data => {
	updateStops();
});
