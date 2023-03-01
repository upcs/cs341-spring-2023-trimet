"use strict";

var map = new ol.Map({
	target: "map",
	layers: [
		new ol.layer.TileLayer({
			source: new ol.source.XYZ({
				url: "https://tiles.trimet.org/styles/trimet/{z}/{x}/{y}.png"
			}),
		}),
	],
	view: new ol.View({
		center: ol.proj.fromLonLat([-122.676483, 45.523064]),
		zoom: 10,
	}),
});
