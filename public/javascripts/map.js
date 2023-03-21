"use strict";

var map = L.map("map").setView([45.523064, -122.676483], 10);

L.tileLayer("https://tiles.trimet.org/styles/trimet/{z}/{x}/{y}.png", {
	maxZoom: 19
}).addTo(map);

var latlngs = [
	[45.423064, -122.576483],
	[45.523064, -122.676483],
	[45.593064, -122.606483],
];

var polyline = L.polyline(latlngs, {
	color: "blue"
}).addTo(map);

polyline.on("click", function(e) {
	console.log("You clicked a polyline", e.target);
});

var marker = L.circleMarker([45.523064, -122.676483], {
	radius: 4,
	color: "green",
	fillOpacity: 1,
}).addTo(map);


marker.on("click", function(e) {
	console.log("You clicked a point", e.target);
});
