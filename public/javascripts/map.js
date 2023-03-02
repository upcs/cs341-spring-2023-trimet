<<<<<<< HEAD
import Map from "/ol/Map.js";
import OSM from "/ol/source/OSM.js";
import TileLayer from "/ol/layer/Tile.js";
import View from "/ol/View.js";
import {fromLonLat} from "/ol/proj.js";
=======
"use strict";
>>>>>>> fb0a24a2102242681e0b2a6c6d31538f322bf768

var map = new ol.Map({
	target: "map",
	layers: [
<<<<<<< HEAD
		new TileLayer({
			source: new OSM(),
=======
		new ol.layer.TileLayer({
			source: new ol.source.XYZ({
				url: "https://tiles.trimet.org/styles/trimet/{z}/{x}/{y}.png"
			}),
>>>>>>> fb0a24a2102242681e0b2a6c6d31538f322bf768
		}),
	],
	view: new ol.View({
		center: ol.proj.fromLonLat([-122.676483, 45.523064]),
		zoom: 10,
	}),
});
