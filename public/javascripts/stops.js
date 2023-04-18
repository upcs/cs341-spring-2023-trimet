"use strict";

var markerColors = {
	unknown: "#000000",
	MAX: "#D81B60",
	BUS: "#1E88E5",
	CR: "#E0A905",
	SC: "#00B307",
	BSC: "#777777",
	AT: "#8931EF",
};

var stopsById = {};
var stopsByOrder = [];

class Stop {
	constructor(id) {
		this.id = id;
	}

	constructRouteStops(stopNode) {
		this.desc = stopNode.getAttribute("desc");
		this.routes = [];
		this.routeButtons = [];

		this.coords = [
			parseFloat(stopNode.getAttribute("lat")),
			parseFloat(stopNode.getAttribute("lng"))
		];
		
		this.selected = false;
		this.zoomShown = false;

		this.marker = L.circle(this.coords, {
			radius: 5,
			color: markerColors.unknown,
			fillColor: markerColors.unknown,
			fillOpacity: 1,
		});
	}

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

function createStops(data) {
	let stopNodes = data.routeStops.querySelectorAll("stop");
	for (let stopNode of stopNodes) {
		let id = stopNode.getAttribute("locid");
		if (id in stopsById) {
			continue;
		}

		let stop = new Stop(id);
		stopsById[id] = stop;
		stopsByOrder.push(stop);

		stop.constructRouteStops(stopNode);
	}

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

staticFetch.addData("routeStops",
	() => fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {
		stops: true,
		dir: true,
	})
);

staticFetch.addData("stopCoords",
	() => fetchXml("https://developer.trimet.org/gis/data/tm_stops.kml")
);

staticFetch.onFetch(data => {
	createStops(data);
});
