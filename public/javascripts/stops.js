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

function mappingStops(xml){
	var xmlDoc = xml.documentElement;
	var stops = xmlDoc.getElementsByTagName("Placemark");

	var coords;
	var type;
	var i = 0;
	//we know how many stops there are
	for (i = 0; i < stops.length; i++) {

		coords = stops[i].getElementsByTagName("Point")[0];
		coords = coords.getElementsByTagName("coordinates")[0];

		//access the extended data to get the type of stop
		type = stops[i].getElementsByTagName("ExtendedData")[0];
		type = type.getElementsByTagName("Data")[4];
		type = type.getElementsByTagName("value")[0];


		//remove ending coords, break up long and lat
		coords = coords.textContent.slice(0, -4);
		const myArray = coords.split(",");
	

		//add coords to map

		//red
		if(type.textContent == "MAX"){
			var circle = L.circle([myArray[1], myArray[0]], {
				color: '#E11845',
				fillColor: '#E11845',
				fillOpacity: 1,
				radius: 5
			}).addTo(map);
		}

		//blue
		if(type.textContent == "BUS"){
			var circle = L.circle([myArray[1], myArray[0]], {
				color: '#0057E9',
				fillColor: '#0057E9',
				fillOpacity: 1,
				radius: 5
			}).addTo(map);
		}

		//purple
		if(type.textContent == "CR"){
			var circle = L.circle([myArray[1], myArray[0]], {
				color: '#8931EF',
				fillColor: '#8931EF',
				fillOpacity: 1,
				radius: 5
			}).addTo(map);
		}

		//yellow
		if(type.textContent == "SC"){
			var circle = L.circle([myArray[1], myArray[0]], {
				color: '#F2CA19',
				fillColor: '#F2CA19',
				fillOpacity: 1,
				radius: 5
			}).addTo(map);
		}

		//green
		if(type.textContent == "BSC"){
			var circle = L.circle([myArray[1], myArray[0]], {
				color: '#87E911',
				fillColor: '#87E911',
				fillOpacity: 1,
				radius: 5
			}).addTo(map);
		}

		//pink
		if(type.textContent == "AT"){
			var circle = L.circle([myArray[1], myArray[0]], {
				color: '#FF00BD',
				fillColor: '#FF00BD',
				fillOpacity: 1,
				radius: 5
			}).addTo(map);
		}

	}

}

staticFetch.addData("stopCoords",
	() => fetchXml("https://developer.trimet.org/gis/data/tm_stops.kml")
);
  
staticFetch.onFetch(data => {
	mappingStops(data.stopCoords);
});