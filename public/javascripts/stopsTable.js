"use strict";

// Create a non-user interactable tab list for the stops sidebar: one page for
// the stops list, and one page for the routes associated with the stop.
var stopPages = new TabList("stops-pages", false)
	.showTab("stops");

var transportTabs = new TabList("stops-transport");

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
 * Shows the stop page and removes any markers that are currently on the map
 * for stops.
 */
function showStopPage() {
	stopPages.showTab("stops");

	for (let stop of stopsByOrder) {
		stop.selected = false;
	}

	checkSelectedVsZoom();
}

/**
 * Shows the routes that corespond with a provided stop within the stops tab
 * before taking the user to the routes pages if a route is clicked.
 */
function showStop(stop) {
	// Removes all currently selected stops.
	for (let stops of stopsByOrder) {
		stops.selected = false;
	}

	stop.selected = true;

	// Show the transport page of the stops tab.
	stopPages.showTab("transport");
	transportTabs.showTab("time");

	// Shows given stop on the map and centers map on it.
	checkSelectedVsZoom();
	centerOnMarker(stop.marker);

	// Empty the content of the list before working with it.
	let transportElem = $("#transport-list");
	transportElem.children().detach();
	let timeElem = $("#time-list");
	timeElem.children().detach();

	// Sets the name of the chosen transport (route).
	$("#transport-chosen").text(stop.desc);

	// Adds all of the route buttons for a given stop to the Routes list in the Stops tab.
	for (let button of stop.routeButtons) {
		transportElem.append(button);
	}
  
	//Calls function that populates the "Arrival Times" tab for a given stop.
	addArrivalTimes(stop);
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
				stop.selected = false;

				sidebarTabs.showTab("routes");
				showRoute(stop.routes[i]);

				checkSelectedVsZoom();
			});
		}

		stop.marker.on("click", e => {
			for (let route of routesByOrder) {
				route.selected = false;

				route.updateShown();
			}

			// Hides any shown lines and any extra stops on the line. Also opens
			// the sidebar tab for the clicked on stop
			updateShownLines();
			clearBuses(dotArr);
			sidebarTabs.showTab("stops");
			showStop(stop);

			//Centers the map on a given stop based on marker clicked
			centerOnMarker(stop.marker);
		});
	}

	// Since the list of buttons was changed, also re-update which ones are
	// shown due to the search bar.
	updateStopSearch();
}


/** 
	This function takes a stop and populates its "arrivalButtons" array. These arrival buttons are what are shown under the "Arrival Times"
	subtab in the Stops tab. It creates a button for each time a bus/max arrives at the given stop, and then appends 
	the buttons onto the "Arrival Times" tab. Could possibly move function elsewhere, ask Vincent.
	Since this is dynamicly fetching data, use "async" and "await". Ask Vincent if you need more information.
*/
async function addArrivalTimes(stop) {
	let transportElem = $("#time-list");
	//Fetches route id that is used in Trimet XML request.
	let stopLocId = stop.id;

	//Fetches data dynamically from Trimet's "arrivals" function, which returns
	//all of the times that a bus/max will visit a given stop over the next hour. 
	//Source: https://developer.trimet.org/ws_docs/arrivals2_ws.shtml

	//id used: 9848 --> this is used as a baseline route id that i can test my bug against.
	let xml = await fetchAppXml("https://developer.trimet.org/ws/v2/arrivals", {
		locIDs: stopLocId,
		json: false
	});
	//All of the main div elements, named "arrival" from the xml.
	let arrivalTimes = xml.querySelectorAll("arrival");

	//Clears the arrays so that it doesn't stack if you click on the same stop multiple times.
	stop.arrivalIds = [];
	stop.arrivalButtons = [];
	
	//for loop that iterates through array of arrival times. It creates the label for each stop, including
	//the estimated time and the "shortSign". The shortSign is the closest thing that 
	//the arrivalTimes xml call provides to the route #.
	for (let i = 0; i < arrivalTimes.length; i++) {
		let arrivalTime = arrivalTimes[i];
		let description = arrivalTime.getAttribute("fullSign");
		let routeID = arrivalTime.getAttribute("route");
		let timeUnix = arrivalTime.getAttribute("estimated");
		//Since using parseInt turns the null into a nan, i save the original value here.
		let isTimeUnixNull = timeUnix;

		//Converts from string into an int. Watch out for this bug...
		timeUnix = parseInt(timeUnix);
		routeID = parseInt(routeID);

		//estimated produces a time int that is "seconds since unix epoch", meaning it's huge.
		//This is a conversion calculator. Taken and modified from alerts.js.
		//source: https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
		//function to convert from unix epoch time to human readable.
		var date = new Date(timeUnix);

		//if getMin is nums 0-9 then print it out like this 00-09
		var min = date.getMinutes();
		var hour = date.getHours();
		//for the unix to timestamp conversion
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		var am = true;//when false it is pm \
		if(date.getMinutes() < 10){
			min = '0' + date.getMinutes();
		}
		//This if else could be useless, but im scared to remove it. Just leave it for a bit longer.pls
		//  else if(date.getHours() < 10){
		// 	hour = date.getHours();
		// 	am = true;
		// }
		//if single digit add leading '0'
		if(date.getHours() >= 12){
			hour = date.getHours() - 12;
			am = false;//as in it is pm
		}//convert to am/pm from 24 hr format
		
		if(date.getHours() == 0){
			hour = 12;
		} 

		var time = date.getDate() + ' ' + 
				months[date.getMonth()] + ', '+ 
				hour + ':' + 
				min;
		//add am/pm to end of time
		if(am){
			time += " am";
		} else {
			time += " pm";
		}
		//Error handling. Handles trimet failing to produce expected time.
		if(isTimeUnixNull == null){
			time = "unknown arrival time";
		}

		//Creates the button then adds it to the array
		let arrivalButton = $("<button>")
			.text(description + ": " + time);
		stop.arrivalIds[i] = routeID;

		for (let j = 0; j < stop.routes.length; j++) {
			if(stop.routes[j].id == routeID){
				arrivalButton.on("click", e => {
					
					sidebarTabs.showTab("routes");
					showRoute(stop.routes[j]);
				});
			}
		}	
		stop.arrivalButtons.push(arrivalButton);
	}
	// Adds all of the arrival buttons to the arrival times list.
	for (let arrbutton of stop.arrivalButtons) {
		transportElem.append(arrbutton);
	}
}//addArrivalTimes

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
	checkSelectedVsZoom();
});

// After fetching data, calls stops in order to create a list of all possible
// stops.
staticFetch.onFetch(data => {
	createStopButtons();
});
