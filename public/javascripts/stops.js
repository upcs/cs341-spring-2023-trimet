"use strict";

var markerColors = {
	MAX: "#E11845",
	BUS: "#0057E9",
	CR: "#8931EF",
	SC: "#F2CA19",
	BSC: "#87E911",
	AT: "#FF00BD",
};

class Stop {
	constructor(id) {
		this.id = id;
	}

	constructRouteStops(stopNode) {
		this.desc = stopNode.getAttribute("desc");
		this.routes = [];
	}

	constructMapData(placemarkNode) {
		var coords;
		var type;

		coords = placemarkNode.getElementsByTagName("Point")[0];
		coords = coords.getElementsByTagName("coordinates")[0];

		//access the extended data to get the type of stop
		type = placemarkNode.getElementsByTagName("ExtendedData")[0];
		type = type.getElementsByTagName("Data")[4];
		type = type.getElementsByTagName("value")[0];


		//remove ending coords, break up long and lat
		coords = coords.textContent.slice(0, -4);
		const myArray = coords.split(",");
		this.location = [myArray[1], myArray[0]];

		let color = markerColors[type.textContent];

		this.marker = L.circle(this.location, {
			color: color,
			fillColor: color,
			fillOpacity: 1,
			radius: 5
		});

		this.marker.addTo(map);
	}

	constructFinal() {
		// TODO
	}

	addParentRoute(route) {
		this.routes.push(route);
	}
}

var allStops = {};

function createStops(data) {
	let stopNodes = data.routeStops.querySelectorAll("stop");
	for (let stopNode of stopNodes) {
		let id = stopNode.getAttribute("locid");
		if (id in allStops) {
			continue;
		}

		allStops[id] = new Stop(id);
		allStops[id].constructRouteStops(stopNode);
	}

	let placemarkNodes = data.stopCoords.querySelectorAll("Placemark");
	for (let placemarkNode of placemarkNodes) {
		let id = placemarkNode.querySelector("[name='stop_id'] > value").textContent;

		// This XML file has stops for the Aerial Tram, but the Routes/Stops
		// file has no such stop. So, ignore any IDs to stops that don't exist.
		if (id in allStops) {
			allStops[id].constructMapData(placemarkNode);
		}
	}

	for (let stop of Object.values(allStops)) {
		stop.constructFinal();
	}

	console.log(allStops);
}

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

staticFetch.addData("stopCoords",
	() => fetchXml("https://developer.trimet.org/gis/data/tm_stops.kml")
);
  
staticFetch.onFetch(data => {
	createStops(data);
});
