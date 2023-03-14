"use strict";
/**
 * A js file that interacts with the side table that displays information about the routes. 
 * utilizes lots of fetch.js functions to grab data from trimet.
////////////////////////////////////////////////////////////////////////////////////
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

//Must, abolutely MUST use event handlers instead of onClick. Otherwise, "This" will simply not work.
$(".line-button").on("click", function() {
	var theBusName = $(this).text();
	fetchStops(theBusName);
});

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
		

	},
	function(status) {
		console.log("We got an error: " + status);
	});
}


/**
 * This function fetches all of the names of the routes that we need and displays them 
 * inside of a table in the left menu.
 */

$("#showNames").on("click", function() {
	fetchNames();
});

function fetchNames() {
	var justry = $(this).text();
	console.log(justry);

	fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {stops: true, dir: true}, function(xml) {
		var i, k;
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