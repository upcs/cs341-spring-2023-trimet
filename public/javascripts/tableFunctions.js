"use strict";
/**
 * A js file that interacts with the side table that displays information about the routes. 
 * utilizes lots of fetch.js functions to grab data from trimet. Table.js has function that hides or shows table.
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


const searchInput = document.querySelector("[route-search]");

searchInput.addEventListener("input", (e) =>{
	const value = e.target.value;
	
	var lowerName = value.toLowerCase();
	console.log(lowerName);

	if(lowerName == ""){
		fetchNames();
	}
	else{
	fetchSearchNames(lowerName);
	}
});




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

		console.log(busName);
		
		//Goes through all available bus lines/ MAX rails in order to find data for given bus/MAX line
		for (i = 0; i < buses.length; i++) {
			if (buses[i].getAttribute("desc") == busName) {
				busNum = i;
			}
		} 

		//Gets destinations for a given form of transportation (always either 1 or 2 destinations)
		var destinations = buses[busNum].getElementsByTagName("dir");

		//Variables used within if statement declared outside so they can be stored.
		var table, dest0Stops, dest1Stops;

		//Checks if there are 1 or 2 destinations. Makes table columns for amount of destinations 
		//and prints stops along the way.
		if (destinations[1] != null) {
			table = "<tr><th>" + destinations[0].getAttribute("desc") + "</th><th>" +
			destinations[1].getAttribute("desc") + "</th></tr>";

			dest0Stops = destinations[0].getElementsByTagName("stop");
			dest1Stops = destinations[1].getElementsByTagName("stop");
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
		}
		else {
			table = "<tr><th>" + destinations[0].getAttribute("desc") + "</th></tr>";
			dest0Stops = destinations[0].getElementsByTagName("stop");
			for (k = 0; k < dest0Stops.length; k++) {
				table += "<tr><td>" + dest0Stops[k].getAttribute("desc") + "</td></tr>";
			}
		}
		document.getElementById("lineTable").innerHTML = table;
		document.getElementById("selectedRoute").innerText = busName;
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
	//Just for debugging purposes. Maybe remove later.
	//var justry = $(this).text();
	//console.log(justry);

	$("#minimizeBtn").show();
	$("#searchbar").show();


	fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {stops: true, dir: true}, function(xml) {
		var i, k;
		var xmlDoc = xml.documentElement;
		var buses = xmlDoc.getElementsByTagName("route");
		//Creates a temporary table that we will put buttons into later.
		var tempTable = "<tr><th> Transportation </th></tr>";

		for (k = 0; k < buses.length; k++) {
			tempTable += "<tr><td> </td></tr>";
		}

		document.getElementById('lineTable').innerHTML = tempTable;
		//Now we begin creating the button
		var table = document.getElementById('lineTable');
		var rows = table.rows;

		//Fetches all of  the names
		for (i = 0; i < rows.length - 1; i++) {
			//Creates new button. Iterates through the larger "buses" xml data that 
			//provides us all of the bus/light rail names.
			var button = document.createElement('button');
			button.innerText = buses[i].getAttribute("desc");
			button.setAttribute('type', 'button');	
			button.setAttribute('class', 'line-button'); 
			//This part is important. Since we are creating this table full of buttons after the program has started, 
			//the previous event listener doesn't work. We must manually add it AFTER the button has been created.
			button.addEventListener("click", function(){
				var theBusName = $(this).text();
				fetchStops(theBusName);
			});
			// TODO ---- ASK MAX TO COMMENT HERE. 
			var cols = rows[i+1].cells;
			var correctCol = rows[i+1]['cells'][cols.length - 1];

			correctCol.appendChild(button);
			document.getElementById("selectedRoute").innerText = " ";
		}
	},
	function(status) {
		console.log("We got an error: " + status);
	});
}

function fetchSearchNames(searchText) {

	fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {stops: true, dir: true}, function(xml) {
		var i, k;
		var xmlDoc = xml.documentElement;
		var buses = xmlDoc.getElementsByTagName("route");
		//Creates a temporary table that we will put buttons into later.
		var tempTable = "<tr><th> Transportation </th></tr>";

		//Now we begin creating the button
		var table = document.getElementById('lineTable');
		var rows = table.rows;
		console.log(rows.length);
		
		for (k = 0; k < rows.length -1; k++) {
			var routeNameNormal = buses[k].getAttribute("desc");
			var routeNameToLower = routeNameNormal.toLowerCase();
			//Only creates spot for button if we're going to need that button
			if(routeNameToLower.includes(searchText)){
			tempTable += "<tr><td> </td></tr>";
			}
			
		}
		document.getElementById('lineTable').innerHTML = tempTable;
		
		//Fetches all of  the names
		for (i = 0; i < rows.length - 1; i++) {
			//Only difference between this function and Show names is that there is an if statement that filters them.
			//The if statement checks the route list to see if any contain the string typed into the search bar.
			var routeNameNormal = buses[i].getAttribute("desc");
			var routeNameToLower = routeNameNormal.toLowerCase();
			if(routeNameToLower.includes(searchText)){
				//Creates new button. Iterates through the larger "buses" xml data that 
				//provides us all of the bus/light rail names.
				var button = document.createElement('button');
				button.innerText = buses[i].getAttribute("desc");
				button.setAttribute('type', 'button');	
				button.setAttribute('class', 'line-button'); 
				//This part is important. Since we are creating this table full of buttons after the program has started, 
				//the previous event listener doesn't work. We must manually add it AFTER the button has been created.
				button.addEventListener("click", function(){
					var theBusName = $(this).text();
					fetchStops(theBusName);
				});
				// TODO ---- ASK MAX TO COMMENT HERE. 
				var cols = rows[i+1].cells;
				var correctCol = rows[i+1]['cells'][cols.length - 1];

				correctCol.appendChild(button);
				document.getElementById("selectedRoute").innerText = " ";
			}
		}
	},
	function(status) {
		console.log("We got an error: " + status);
	});
}





