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

	var tempPoint;
	var tempCoords;
	stops.childNodes.forEach(myFunction);
	//this should loop through all the stops
	function myFunction(item){
		tempPoint = item.getElementsByTagName("Point");
		tempCoords = temp.getElementsByTagName("coordinates");

		//call function to place an icon at tempCoords coordinates
		console.log("coords: " + tempCoords);
	}





	},
	function(status) {
		console.log("mappingStops.js error: " + status);
	});
}