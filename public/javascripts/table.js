"use strict";

// Create a non-user interactable tab list for the routes sidebar: one page for
// the routes list, and one page for the directions.
var routePages = new TabList("routes-pages", false)
	.showTab("routes");

// Create a tab list for the inbound and outbound direction tabs.
var dirsTabs = new TabList("routes-dir");

/**
 * Updates the list of stops in each direction displayed in the sidebar in
 * accord with a certain route.
 *
 * @param routeNode The XML node from the routeStops XML for the directions and
 *                  stops to display.
 */
function updateDirs(routeNode) {
	// When we show directions, always show the first tab.
	dirsTabs.showTab("dir-0");

	// It's possible for a route to only have one direction, so hide both tabs
	// and empty their contents for now.
	$("#dir-0-selector, #dir-1-selector").hide().text("");
	$("#dir-0-list, #dir-1-list").empty();

	// Update the text for the route we chose.
	$("#dir-chosen").text(routeNode.getAttribute("desc"));

	// Loop over the directions we have as children, which may be one or two.
	for (let dirNode of routeNode.children) {
		let dir = dirNode.getAttribute("dir");

		// Reshow the selector for this direction and give it the right label.
		$("#dir-" + dir + "-selector")
			.show()
			.text(dirNode.getAttribute("desc"));

		// Get the list for this direction.
		let dirElem = $("#dir-" + dir + "-list").scrollTop(0);

		// Add all the stops that this direction has to the list.
		for (let stopNode of dirNode.children) {
			let buttonElem = $("<button>").text(stopNode.getAttribute("desc"));
			dirElem.append(buttonElem);
		}
	}
}

/**
 * Updates which route buttons are shown or hidden based on the current search
 * terms that are listed in the search bar.
 */
function updateRouteSearch() {
	let routesElem = $("#routes-list");

	// Get our search term with case insensitivity and ignoring leading or
	// trailing whitespace.
	let searchTerm = $("#routes-search").val().trim().toLowerCase();

	// Loop over all the buttons in our routes and decide which ones to show
	// and hide.
	for (let buttonElem of routesElem.children()) {
		// Get the button route name, also case insensitive.
		buttonElem = $(buttonElem);
		let routeName = buttonElem.text().toLowerCase();

		// If the button's route name includes the search term, show this
		// button in case it was hidden before. Otherwise, hide this button.
		if (routeName.includes(searchTerm)) {
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
function updateRoutes() {
	let xml = staticFetch.data.routeStops;

	// Get and clear out our current list of routes.
	let routesElem = $("#routes-list").empty();

	// Loop over all the route children of the root of the XML document and add
	// buttons for each of them.
	for (let routeNode of xml.documentElement.children) {
		let buttonElem = $("<button>")
			.text(routeNode.getAttribute("desc"))
			.on("click", e => {
				// When the button is clicked, show the stops for that route.
				routePages.showTab("dirs");
				updateDirs(routeNode);
			});

		routesElem.append(buttonElem);
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
	routePages.showTab("routes");
});

// When the direction tabs are clicked, scroll the lists back to the top.
$("#dir-0-selector, #dir-1-selector").on("click", e => {
	$("#dir-0-list, #dir-1-list").scrollTop(0);
});

/* Fetch our list of routes with stops for the table as a static fetch. It's
 * possible, although highly improbably, for routes to change while the user is
 * using the app; however, it's too unlikely to bother about, so a page refresh
 * is required to see new routes.
 */
staticFetch.addData("routeStops",
	() => fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {
		stops: true,
		dir: true,
	})
);

// Once we have our static data, update the routes in the table.
staticFetch.onFetch(data => {
	updateRoutes();
});
