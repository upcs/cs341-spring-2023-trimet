"use strict";

class Route {
	constructor(id) {
		this.id = id;
	}

	constructRouteStops(routeNode) {
		this.desc = routeNode.getAttribute("desc");
		this.routeSubType = routeNode.getAttribute("routeSubType");

		this.stops = [[], []];

		for (let dirNode of routeNode.children) {
			let dir = dirNode.getAttribute("dir");
			let stopList = this.stops[dir];

			for (let stopNode of dirNode.children) {
				let id = stopNode.getAttribute("locid");
				let stop = allStops[id];

				stopList.push(stop);
				stop.addParentRoute(this);
			}
		}
	}

	constructMapData(placemarkNode) {
		var coordList;
		var coords;
		var type;

		this.lines = [];
		
		coordList = placemarkNode.querySelectorAll("coordinates");
		type = placemarkNode.querySelector("[name='type'] > value");
				
		//find coordinates
		for(coords of coordList){
			var finalCoords = [];
			coords = coords.textContent;
			const myArray = coords.split(" ");

			//splice into final array
			for(let i = 0; i < myArray.length; i++){
				myArray[i] = myArray[i].slice(0,-4);
				const coordArray = myArray[i].split(",");
				finalCoords.push([coordArray[1], coordArray[0]]);
			}
			
			//draw the line
        	//color code

			let color = markerColors[type.textContent];

			this.polyline = L.polyline(finalCoords, {color}).addTo(map);
		}
	}

	constructFinal() {
		// TODO
	}
}

var allRoutes = {};

function createRoutes(data) {
	let routeNodes = data.routeStops.querySelectorAll("route");
	for (let routeNode of routeNodes) {
		let id = routeNode.getAttribute("id");
		allRoutes[id] = new Route(id);

		allRoutes[id].constructRouteStops(routeNode);
	}

	let placemarkNodes = data.routeCoords.querySelectorAll("Placemark");
	for (let placemarkNode of placemarkNodes) {
		let id = placemarkNode.querySelector("[name='route_number'] > value").textContent;

		// See createStops() for the reason behind this if statement.
		if (id in allRoutes) {
			allRoutes[id].constructMapData(placemarkNode);
		}
	}

	for (let route of Object.values(allRoutes)) {
		route.constructFinal();
	}

	console.log(allRoutes);
}

staticFetch.addData("routeCoords",
	() => fetchXml("https://developer.trimet.org/gis/data/tm_routes.kml")
);
  
staticFetch.onFetch(data => {
	createRoutes(data);
});
