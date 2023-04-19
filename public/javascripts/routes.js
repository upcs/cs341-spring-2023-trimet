"use strict";

var routesById = {};//hash table by id
//when the hash table key is a number (like our id's)
//they are reordered by acending key nums, which is out of order
var routesByOrder = [];//ordered route list

//groups stops by direction on route
class RouteDir {
	constructor(route, dir, dirNode) {
		this.route = route;
		this.dir = dir;

		this.desc = dirNode.getAttribute("desc");

		this.stops = [];//list of stops in dir
		this.buttons = [];//list of buttons for each stop

		//loops through stops
		for (let stopNode of dirNode.children) {
			let id = stopNode.getAttribute("locid");
			let stop = stopsById[id];

			this.stops.push(stop);//add stop to list
			//establishes parent route reference
			stop.constructParentRoute(this.route);

			//creates a button for the stop
			let button = $("<button>")
				.text(stop.desc);
			this.buttons.push(button);
		}
	}
}

//object to hold a single transit route and its info instead
//of parsing the XML everytime we need this route
class Route {
	//establishes the id, the most important detail
	constructor(id) {
		this.id = id;
	}

	//creates the name and coordinates and map marker
	constructRouteStops(routeNode) {
		this.desc = routeNode.getAttribute("desc");
		this.routeSubType = routeNode.getAttribute("routeSubType");

		this.dirs = [];//list of directions (ex. north/south bound)
		this.stops = [];//list of stops

		//loops through each stop on this route
		for (let dirNode of routeNode.children) {
			let dir = dirNode.getAttribute("dir");

			let routeDir = new RouteDir(this, dir, dirNode);
			this.dirs[dir] = routeDir;

			this.stops = this.stops.concat(routeDir.stops);
		}

		//these are created here and not in conscruct map data because
		//some routes don't have polylines but the array must exist
		//so we have a empty list instead of undefined 
		this.lines = [];//list of all coordinate nodes
		this.polylines = [];//list of leaflet map layers
    
    this.pinned = false;
    this.selected = false;
	}

	//adds the routes onto the map
	constructMapData(placemarkNode) {
		let coordsNodes = placemarkNode.querySelectorAll("coordinates");

		let typeNode = placemarkNode.querySelector("[name='type'] > value");
		let color = markerColors[typeNode.textContent];

		//loops through route coordinate nodes
		for (let coordsNode of coordsNodes) {
			let points = coordsNode.textContent.split(" ");
			let line = [];

			for (let point of points) {
				let flipped = point
					.split(",")
					.map(s => parseFloat(s));

				line.push([flipped[1], flipped[0]]);
			}

			//creates the leaflet layer
			let polyline = L.polyline(line, {
				weight: 4,
				color: color,
			});

			this.lines.push(line);//add coordinates to list
			//add layers to leaflet layers list
			this.polylines.push(polyline);
		}
	}

	//creates button for viz table
	constructElems() {
		this.button = $("<button>")
			.text(this.desc);
	}

	isShown() {
		return this.selected || this.pinned;
	}

  // Updates routes shown on map based on whether a route is selected or pinned
	updateShown() {
		if (this.isShown()) {
			this.polylines.forEach(p => p.addTo(map));
		} else {
			this.polylines.forEach(p => p.remove());
		}

		for (let dir of this.dirs) {
			for (let stop of dir.stops) {
				stop.updateShown();
			}
		}


	pin() {
		this.pinned = true;
		this.button.attr("data-pin", true);
	}

	unpin() {
		this.pinned = false;
		this.button.removeAttr("data-pin");
	}

	togglePin() {
		if (this.pinned) {
			this.unpin();
		} else {
			this.pin();
		}
	}
}

//runs after XML files have been fetched
//parses the XML files into route objects
function createRoutes(data) {
	//loops thorugh routeStops XML file
	let routeNodes = data.routeStops.querySelectorAll("route");
	for (let routeNode of routeNodes) {
		let id = routeNode.getAttribute("id");

		let route = new Route(id);
		routesById[id] = route; //adds route to hash table
		routesByOrder.push(route); //adds route to ordered list

		//creates the name, coordinates and map marker
		route.constructRouteStops(routeNode);
	}

	//loops through routeCoords XML file
	let placemarkNodes = data.routeCoords.querySelectorAll("Placemark");
	for (let placemarkNode of placemarkNodes) {
		let id = placemarkNode.querySelector("[name='route_number'] > value").textContent;

		// The geo data XML file has stops that the routes/stops XML file does
		// not, such as for the Aerial Tram. So, ignore any missing IDs.
		if (id in routesById) {
			routesById[id].constructMapData(placemarkNode);
		}
	}

	//creates a button for each route
	for (let route of routesByOrder) {
		route.constructElems();
	}
}


//there are two XML files that hold all the info we need to
//create a route object: routeStops and routeCoords

//fetch route coordinates
staticFetch.addData("routeCoords",
	() => fetchXml("https://developer.trimet.org/gis/data/tm_routes.kml")
);

//fetches routeStops in stops.js

//once they have both been fetched create the route objects
staticFetch.onFetch(data => {
	createRoutes(data);
});
