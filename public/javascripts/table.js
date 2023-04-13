"use strict";

// Create a non-user interactable tab list for the routes sidebar: one page for
// the routes list, and one page for the directions.
var routePages = new TabList("routes-pages", false)
	.showTab("routes");

// Create a tab list for the inbound and outbound direction tabs.
var dirsTabs = new TabList("routes-dir");

function updateRouteSearch() {
	// Get our search term with case insensitivity and ignoring leading or
	// trailing whitespace.
	let searchTerm = $("#routes-search").val().trim().toLowerCase();

	// Loop over all of our routes and decide which buttons to show and hide.
	for (let route of routesByOrder) {
		// Get the route description, also case insensitively.
		let routeName = route.desc.toLowerCase();

		// If the description includes the search term, show this button in
		// case it was hidden before. Otherwise, hide this button.
		if (routeName.includes(searchTerm)) {
			route.button.show();
		} else {
			route.button.hide();
		}
	}
}

function hideAllLines() {
	for (let route of routesByOrder) {
		route.hideLines();
		route.stops.forEach(s => s.hideMarker());
	}
}

function showAllRoutes() {
	// Show the routes page of the routes tab and hide everything on the map.
	routePages.showTab("routes");
	hideAllLines();
}

function showRoute(route) {
	// Hides any lines currently on the map
	hideAllLines();

	// Show the dirs page of the routes tab.
	routePages.showTab("dirs");

	// Show this route's markers on the map.
	route.showLines();
	route.stops.forEach(s => s.showMarker());

	// When we show directions, always show the first tab.
	dirsTabs.showTab("dir-0");

	// It's possible for a route to only have one direction, so hide both tabs
	// and empty their contents for now.
	$("#dir-0-selector, #dir-1-selector").hide().text("");
	$("#dir-0-list, #dir-1-list").children().detach();

	// Update the text for the route we chose.
	$("#dir-chosen").text(route.desc);

	// Loop over the directions we have, which may be one or two.
	for (let dir in route.dirs) {
		let routeDir = route.dirs[dir];

		// Reshow the selector for this direction and give it the right label.
		$("#dir-" + dir + "-selector")
			.show()
			.text(routeDir.desc);

		// Get the list for this direction and scroll it to the top.
		let dirElem = $("#dir-" + dir + "-list")
			.scrollTop(0);

		// Add all the stops that this direction has to the list.
		for (let button of routeDir.buttons) {
			dirElem.append(button);
		}
	}
}

function createRouteButtons() {
	// Get and clear out our current list of routes.
	let routesElem = $("#routes-list").empty();

	// Loop through all the routes and their directions in order to add their
	// buttons and bind event listeners.
	for (let route of routesByOrder) {
		// When a route button is clicked, show the route.
		route.button.on("click", e => {
			showRoute(route);
		});

		// Add this route's button to the sidebar.
		routesElem.append(route.button);

		// Loop over every stop in each direction of the route.
		for (let routeDir of Object.values(route.dirs)) {
			for (let i = 0; i < routeDir.stops.length; i++) {
				// When a direction stop button is clicked, show the stop.
				routeDir.buttons[i].on("click", e => {
					sidebarTabs.showTab("stops");
					showStop(routeDir.stops[i]);

					// Hides given line as well as shows stop clicked on.
					hideAllLines();
					routeDir.stops[i].showMarker();
				});
			}
		}
	}

	// Since the list of buttons was changed, also re-update which ones are
	// shown due to the search bar.
	updateRouteSearch();
}

// When the search bar is edited, update the list of routes.
$("#routes-search").on("input", e => {
	updateRouteSearch();
});

// Clear and refocus the search field when clicking the X button, and update
// the list of routes.
$("#routes-clear-search").on("click", e => {
	$("#routes-search").val("").focus();
	updateRouteSearch();
});

// Go back to the list of routes when the user clicks the back button.
$("#dir-back").on("click", e => {
	showAllRoutes();
});

// When the direction tabs are clicked, scroll the lists back to the top.
$("#dir-0-selector, #dir-1-selector").on("click", e => {
	$("#dir-0-list, #dir-1-list").scrollTop(0);
});

// Once we have our static data, show the routes in the table.
staticFetch.onFetch(data => {
	createRouteButtons();
});
