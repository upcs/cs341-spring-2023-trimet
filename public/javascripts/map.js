"use strict";

var map = L.map("map").setView([45.523064, -122.676483], 10);

L.tileLayer("https://tiles.trimet.org/styles/trimet/{z}/{x}/{y}.png", {
	maxZoom: 19
}).addTo(map);
