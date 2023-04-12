"use strict";

// Create a non-user interactable tab list for the stops sidebar: one page for
// the stops list, and one page for the routes associated with the stop.
var stopPages = new TabList("stops-pages", false)
	.showTab("stops");

// Create a tab list for the routes associate with a given stop.
var transportTabs = new TabList("transport-type");

/** 
 * Displays list of stop buttons based on a user inputed key word or stop 
 * name. 
 */
function updateStopSearch() {
	// Get our search term with case insensitivity and ignoring leading or
	// trailing whitespace.
	let searchTerm = $("#stops-search").val().trim().toLowerCase();

	// Loop over all of our stops and decide which buttons to show and hide.
	for (let stop of stopsByOrder) {
		// Get the stops description, also case insensitively.
		let stopName = stop.desc.toLowerCase();

		// If the description includes the search term, show this button in
		// case it was hidden before. Otherwise, hide this button.
		if (stopName.includes(searchTerm)) {
			stop.button.show();
		} else {
			stop.button.hide();
		}
	}
}

/** 
 * Shows the routes that corespond with a provided stop within the stops tab
 * before taking the user to the routes pages if a route is clicked.
 */
function showStop(stop) {
	// Show the transport page of the stops tab.
	stopPages.showTab("transport");

	// Shows the specific transport tab being worked with.
	transportTabs.showTab("transport-0");

	// Hides the tab and empties content before working with it.
	$("#transport-selector").hide().text("");
	$("#transport-0-list").children().detach();

	// Sets the name of the chosen transport (route).
	$("#transport-chosen").text(stop.desc);

	let routeElem = $("#transport-0-list").scrollTop(0);

	// Adds all of the route buttons for a given stop to the list.
	for (let button of stop.routeButtons) {
		routeElem.append(button);
	}
}

/**
 * Creates the list of buttons for every stop. Also sets up
 * interaction with one of the given route buttons if clicked.
 */
function createStopButtons() {
	// Clears current list of stops if tab isn't empty.
	let stopsElem = $("#stops-list").empty();

	// Loops through every stop and creates a clickable button that will
	// bring up a tab that shows the routes for the given stop.
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

// After fetching data, calls stops in order to create a list of all possible stops.
staticFetch.onFetch(data => {
	createStopButtons();
});
