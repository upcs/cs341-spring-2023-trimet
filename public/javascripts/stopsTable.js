"use strict";

// Create a non-user interactable tab list for the stops sidebar: one page for
// the stops list, and one page for the routes associated with the stop.
var stopPages = new TabList("stops-pages", false)
	.showTab("stops");

// Hide special elements in the stops list initially.
$("#stops-search-message").hide();

// Maximum number of stops to show in the sidebar for a search.
var MAX_STOPS_SEARCH = 500;

/**
 * Displays list of stop buttons based on a user inputed key word or stop name.
 */
function updateStopSearch() {
	// Get our search term with case insensitivity and ignoring leading or
	// trailing whitespace.
	let searchTerm = $("#stops-search").val().trim().toLowerCase();

	// First, hide all the buttons and count how many should be shown to decide
	// whether to show them or not.
	let count = 0;

	for (let stop of stopsByOrder) {
		// Get the route description, also case insensitively.
		let stopName = stop.desc.toLowerCase();

		stop.button.hide();
		if (stopName.includes(searchTerm)) {
			count++;
		}
	}

	// Choose the message to show, if any.
	let messageElem = $("#stops-search-message");

	if (searchTerm === "") {
		messageElem.text("Enter search term").show();
	} else if (count === 0) {
		messageElem.text("No results found").show();
	} else if (count > MAX_STOPS_SEARCH) {
		messageElem.text("Search too broad").show();
	} else {
		// Otherwise, hide the message and show all the matching stops.
		messageElem.hide();

		for (let stop of stopsByOrder) {
			let stopName = stop.desc.toLowerCase();

			if (stopName.includes(searchTerm)) {
				stop.button.show();
			}
		}
	}
}

/**
 * Hides all stops on the map in case more than one are displayed at once.
 */
function hideAllStops() {
	for (stop of stopsByOrder) {
		stop.hideMarker();
	}
}

/**
 * Shows the stop page and removes any markers that are currently on the map
 * for stops.
 */
function showStopPage() {
	stopPages.showTab("stops");
	hideAllStops();
}

/**
 * Shows the routes that corespond with a provided stop within the stops tab
 * before taking the user to the routes pages if a route is clicked.
 */
function showStop(stop) {
	hideAllLines();

	// Show the transport page of the stops tab.
	stopPages.showTab("transport");

	// Shows given stop on the map
	stop.showMarker();

	// Empty the content of the list before working with it.
	let transportElem = $("#transport-list");
	transportElem.children().detach();

	// Sets the name of the chosen transport (route).
	$("#transport-chosen").text(stop.desc);

	// Adds all of the route buttons for a given stop to the list.
	for (let button of stop.routeButtons) {
		transportElem.append(button);
	}
}

/**
 * Creates the list of buttons for every stop. Also sets up interaction with
 * one of the given route buttons if clicked.
 */
function createStopButtons() {
	// Remove our loading bar.
	$("#stops-loading").remove();

	// Get the container for the stop buttons.
	let stopsElem = $("#stops-list");

	// Loops through every stop and creates a clickable button that will bring
	// up a tab that shows the routes for the given stop.
	for (let stop of stopsByOrder) {
		// When a stop button is clicked, show the stop.
		stop.button.on("click", e => {
			showStop(stop);
		});

		// Add this stop's button to the sidebar.
		stopsElem.append(stop.button);

		// Loops through every route for a given stop and creates its button.
		for (let i = 0; i < stop.routes.length; i++) {
			stop.routeButtons[i].on("click", e => {
				sidebarTabs.showTab("routes");
				showRoute(stop.routes[i]);
			});
		}
	}

	// Since the list of buttons was changed, also re-update which ones are
	// shown due to the search bar.
	updateStopSearch();
}

// When the search bar is edited and enter is clicked, updates stop list with
// relevant stops based on search entered.
$("#stops-search").on("input", e => {
	updateStopSearch();
});

// Clear and refocus the search field when clicking the X button.
$("#stops-clear-search").on("click", e => {
	$("#stops-search").val("").focus();
	updateStopSearch();
});

// Goes back to the list of stops found from the given search
$("#transport-back").on("click", e => {
	showStopPage();
});

// After fetching data, calls stops in order to create a list of all possible
// stops.
staticFetch.onFetch(data => {
	createStopButtons();
});
