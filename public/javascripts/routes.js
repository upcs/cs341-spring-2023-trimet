"use strict";

var routesById = {};
var routesByOrder = [];

class RouteDir {
	constructor(route, dir, dirNode) {
		this.route = route;
		this.dir = dir;

		this.desc = dirNode.getAttribute("desc");

		this.stops = [];
		this.buttons = [];

		for (let stopNode of dirNode.children) {
			let id = stopNode.getAttribute("locid");
			let stop = stopsById[id];

			this.stops.push(stop);
			stop.constructParentRoute(this.route);

			let button = $("<button>")
				.text(stop.desc);
			this.buttons.push(button);
		}
	}
}

class Route {
	constructor(id) {
		this.id = id;
	}

	constructRouteStops(routeNode) {
		this.desc = routeNode.getAttribute("desc");
		this.routeSubType = routeNode.getAttribute("routeSubType");

		this.dirs = {};
		this.stops = [];

		for (let dirNode of routeNode.children) {
			let dir = dirNode.getAttribute("dir");

			let routeDir = new RouteDir(this, dir, dirNode);
			this.dirs[dir] = routeDir;

			this.stops = this.stops.concat(routeDir.stops);
		}

		this.lines = [];
		this.polylines = [];

		this.pinned = false;
	}

	constructMapData(placemarkNode) {
		let coordsNodes = placemarkNode.querySelectorAll("coordinates");

		let typeNode = placemarkNode.querySelector("[name='type'] > value");
		let color = markerColors[typeNode.textContent];

		for (let coordsNode of coordsNodes) {
			let points = coordsNode.textContent.split(" ");
			let line = [];

			for (let point of points) {
				let flipped = point
					.split(",")
					.map(s => parseFloat(s));

				line.push([flipped[1], flipped[0]]);
			}

			let polyline = L.polyline(line, {
				weight: 4,
				color: color,
			});

			this.lines.push(line);
			this.polylines.push(polyline);
		}
	}

	constructElems() {
		this.button = $("<button>")
			.text(this.desc);
	}

	showLines() {
		this.polylines.forEach(p => p.addTo(map));
	}

	hideLines() {
		this.polylines.forEach(p => p.remove());
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

function createRoutes(data) {
	let routeNodes = data.routeStops.querySelectorAll("route");
	for (let routeNode of routeNodes) {
		let id = routeNode.getAttribute("id");

		let route = new Route(id);
		routesById[id] = route;
		routesByOrder.push(route);

		route.constructRouteStops(routeNode);
	}

	let placemarkNodes = data.routeCoords.querySelectorAll("Placemark");
	for (let placemarkNode of placemarkNodes) {
		let id = placemarkNode.querySelector("[name='route_number'] > value").textContent;

		// See createStops() for the reason behind this if statement.
		if (id in routesById) {
			routesById[id].constructMapData(placemarkNode);
		}
	}

	for (let route of routesByOrder) {
		route.constructElems();
	}
}

staticFetch.addData("routeCoords",
	() => fetchXml("https://developer.trimet.org/gis/data/tm_routes.kml")
);

staticFetch.onFetch(data => {
	createRoutes(data);
});
