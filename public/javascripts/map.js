"use strict";

var map = L.map("map").setView([45.523064, -122.676483], 10);

L.tileLayer("https://tiles.trimet.org/styles/trimet/{z}/{x}/{y}.png", {
	maxZoom: 19,
	minZoom: 9,
}).addTo(map);

// Sets bounds on map in order to stop user from leaving Oregon on the map.
map.setMaxBounds(map.getBounds());


// Shows markers within the map's bounds based on zoom distance on map.
map.on("zoomend dragend click", function (e) {
	checkSelectedVsZoom();
});

/**
 * Checks if there is a selected route or stop. If so it does not allow stops 
 * to show up based on zoom. 
 */
function checkSelectedVsZoom() {
	let stopSelected = false;
	let routeSelected = false;

	for (let stop of stopsByOrder) {
		stopSelected = stop.selected;
		// Breaks the for loop if a selected stop is found.
		if (stopSelected == true) {
			break;
		}
	}

	for (let route of routesByOrder) {
		routeSelected = route.selected;
		//If a selected route is found, stops looping through.
		if (routeSelected == true) {
			break;
		}
	}

	//Checks if there is currently displayed route or stop. If so then it does not
	//display stops besides the selected one.
	if (stopSelected || routeSelected) {
		for (let stop of stopsByOrder) {
			stop.zoomShown = false;

			stop.updateShown();
		}
	}
	else {
		if (map.getZoom() > 15) {
			for (let stop of stopsByOrder) {
				var LatLng = stop.marker.getLatLng();

				// Checks to see if the stop is within the current maps bounds
				// and displays the marker if it is.
				stop.zoomShown = map.getBounds().contains(LatLng);

				stop.updateShown();
			}
		}
		else {
			for (let stop of stopsByOrder) {
				stop.zoomShown = false;

				stop.updateShown();
			}
		}
	}
}

/**
 * Center's the map on a given stop's marker by taking the longitude and
 * latitute and creating bounds for the map using those coordinates.
 * 
 * @param marker	The stop marker that we want to focus on.
 */
function centerOnMarker(marker) {
	var latLngs = [ marker.getLatLng() ];
	var markerBounds = L.latLngBounds(latLngs);
	map.fitBounds(markerBounds, {maxZoom: 18});
}

/**
 * Center's the map on a given route by taking every stop within the route
 * and taking the map's bounds at that given stop marker. It then adds those map bounds
 * together so that it will display all the stop markers which shows the route.
 * 
 * @param route		The route that we want to have the map focus on. 
 */
function centerOnRoute(route) {
	var bounds = L.latLngBounds();

	for (stop of route.stops) {
		bounds.extend(stop.coords);
	}
	
	for (let line of route.lines) {
		for (let point of line) {
			bounds.extend(point);
		}
	}

	map.fitBounds(bounds);
}

/**
 * Used for pinning routes. When a route gets pinned it provides it with a color in order
 * to easily differentiate between pinned and selected routes. Also changes color back to
 * default once a route becomes unpinned. 
 */
function colorFinder() {
	// Variable correlates to a given hashmap value.
	// Starts at 1 due to fact that 0 is default color
	let color = 1;

	for (let route of routesByOrder) {
		// Needed to prevent errors due to fact that the MAX Shuttle does not have polylines.
		if (route.id == "98") {
			break;
		}

		// If color exceeds hashmap color values, it resets it back to the first instance '1'.
		// Otherwise it iterates up in order to prevent 2 pinned routes from having same color.
		if (route.polylines[0].options.color != "#7E7E7E") {
			if (color >= 6) {
				color = 1;
			}
			else {
				color++;
			}
		}

		if (route.selected) {
			// Removes route and stops with default colors.
			route.polylines.forEach(p => p.remove());
			for (let dir of route.dirs) {
				for (let stop of dir.stops) {
					stop.marker.remove();
				}
			}

			// Sets route and stop's fill to color coordinating to hashmap value.
			if (route.pinned) {
				for (let polyline of route.polylines) {
					polyline.setStyle({color: markerColors[color]});
				}

				for (let stop of route.stops) {
					stop.marker.setStyle({fillColor: markerColors[color]})
				}
			} // Used to change route and stops back to default color.
			else {
				for (let polyline of route.polylines) {
					polyline.setStyle({color: markerColors[0]})
				}

				for (let stop of route.stops) {
					stop.marker.setStyle({fillColor: markerColors["#000000"]})
				}
			}

			// Displays the route and all its stops again after changing color.
			// Must remove and add stops back in order to prevent route lines from
			// overlapping the stops. 
			route.polylines.forEach(p => p.addTo(map));
			for (let dir of route.dirs) {
				for (let stop of dir.stops) {
					stop.marker.addTo(map);
				}
			}
		}	
	}

	
}
