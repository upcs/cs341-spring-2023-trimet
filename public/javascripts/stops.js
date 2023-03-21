"use strict";
/**
 * A js file that interacts with the map to display icons at each coordinate
 * for a transit stop.
 * utilizes lots of fetch.js functions to grab data from trimet.
/////////////////////////////////////////////////////////////////////////
 * Gets all BUSc MAX, Street-Car, and Commuter-Rail stops using the
 * function to fetch xml data from the trimet database
 */

//still need an event handler but for on load of the map

/*
'item' inside the foreach loop is the following (it's an example with values)

<Placemark id="135411">
	<name>SW 35th &amp; Indian Hills Apts</name>
	<ExtendedData>
		<Data name="stop_id">
			<value>7420</value>
		</Data>
		<Data name="stop_name">
			<value>SW 35th &amp; Indian Hills Apts</value>
		</Data>
		<Data name="jurisdiction">
			<value>Portland</value>
		</Data>
		<Data name="zipcode">
			<value>97219</value>
		</Data>
		<Data name="type">
			<value>BUS</value>
		</Data>
	</ExtendedData>
	<Point id="135410">
		<coordinates>-122.71156858794033,45.455159579271324,0.0</coordinates>
	</Point>
</Placemark>

we just want coordinates for now
*/

function mappingStops(){
	fetchAppXml("https://developer.trimet.org/gis/data/tm_stops.kml", {ll: true},
	function(xml) {

	var xmlDoc = xml.documentElement;
	var stops = xmlDoc.getElementsByTagName("Placemark");
	//console.log("HERE! stops.js line 51");

	var temp;
	var tempCoords;
	var i = 0;
	//we know how many stops there are
	for (i = 0; i < 6468; i++) {
		//console.log("iteration: " + i);

		temp = stops[i].getElementsByTagName("Point")[0];
		tempCoords = temp.getElementsByTagName("coordinates")[0];

		//call function to place an icon at tempCoords coordinates
		console.log("coords at iteration: " + tempCoords.textContent);

		//add coords to map
		
	}





	},
	function(status) {
		console.log("mappingStops.js error: " + status);
	});
}