"use strict";

//hashtable to assign colors to types of transit
//this may be changed in favor of coloring based on which
//routes we are comparing instead of types of transit
var markerColors = {
	unknown: "#000000",
	MAX: "#D81B60",
	BUS: "#1E88E5",
	CR: "#E0A905",
	SC: "#00B307",
	BSC: "#777777",
	AT: "#8931EF",
};

var stopsById = {}; //hash table by id
//when the hash table key is a number (like our id's)
//they are reordered by acending key nums, which is out of order
var stopsByOrder = []; //ordered stops list

//object to hold a single transit stop and its info instead
//of parsing the XML everytime we need this stop
class Stop {
	//establishes the id, the most important detail
	constructor(id) {
		this.id = id;
	}

	//creates the name, coordinates and map marker
	constructRouteStops(stopNode) {
		this.desc = stopNode.getAttribute("desc");
		this.routes = []; //list of parent route references
    
    //list of buttons for the routes that go through a given stop
    this.routeButtons = [];

		this.coords = [
			parseFloat(stopNode.getAttribute("lat")),
			parseFloat(stopNode.getAttribute("lng"))
		];
		
		this.selected = false;
		this.zoomShown = false;

		this.marker = L.circle(this.coords, {
			radius: 5,
			color: markerColors.unknown, //is defined in consctuctMapData()
			fillColor: markerColors.unknown, //is defined in consctuctMapData()
			fillOpacity: 1,
		});
	}

	//adds color to map icon
	constructMapData(placemarkNode) {
		let typeNode = placemarkNode.querySelector("[name='type'] > value");
		let color = markerColors[typeNode.textContent];

		this.marker.setStyle({
			color: color,
			fillColor: color,
		});
	}

	constructElems() {
		this.button = $("<button>")
			.text(this.desc);
	}
  
  //parent reference to all routes this stop is on
	constructParentRoute(route) {
		this.routes.push(route);

		let routeButton = $("<button>")
			.text(route.desc);
		this.routeButtons.push(routeButton);
	}

	isShown() {
		let shown = this.selected || this.zoomShown;
		for (let route of this.routes) {
			if (route.isShown()) {
				shown = true
			}
		}

		return shown;
	}

	updateShown() {
		if (this.isShown()) {
			this.marker.addTo(map);
		} else {
			this.marker.remove();
		}
	}
}

//runs after XML files have been fetched
//parses the XML files into stop objects
function createStops(data) {
	//loops through routeStops XML file
	let stopNodes = data.routeStops.querySelectorAll("stop");
	for (let stopNode of stopNodes) {
		let id = stopNode.getAttribute("locid");
		//prevent duplicate stops (which do exist in the XML files)
		if (id in stopsById) {
			continue;
		}

		let stop = new Stop(id);
		stopsById[id] = stop; //adds stop to hash table
		stopsByOrder.push(stop); //adds stop to ordered list

		//creates the name, coordinates and map marker
		stop.constructRouteStops(stopNode);
	}

	//loops through stopCoords XML file
	let placemarkNodes = data.stopCoords.querySelectorAll("Placemark");
	for (let placemarkNode of placemarkNodes) {
		let id = placemarkNode.querySelector("[name='stop_id'] > value").textContent;

		// The geo data XML file has stops that the routes/stops XML file does
		// not, such as for the Aerial Tram. So, ignore any missing IDs.
		if (id in stopsById) {
			stopsById[id].constructMapData(placemarkNode);
		}
	}

	for (let stop of stopsByOrder) {
		stop.constructElems();
	}
}

//there are two XML files that hold all the info we need to
//create a stop object: routeStops and stopCoords

//fetch stop list
staticFetch.addData("routeStops",
	() => fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {
		stops: true,
		dir: true,
	})
);

//fetch stop coordinates
staticFetch.addData("stopCoords",
	() => fetchXml("https://developer.trimet.org/gis/data/tm_stops.kml")
);

//once they have both been fetched create the stop objects
staticFetch.onFetch(data => {
	createStops(data);
});
