import Map from "/ol/Map.js";
import OSM from "/ol/source/OSM.js";
import TileLayer from "/ol/layer/Tile.js";
import View from "/ol/View.js";
import {fromLonLat} from "/ol/proj.js";

const map = new Map({
	target: "map",
	layers: [
		new TileLayer({
			source: new OSM(),
		}),
	],
	view: new View({
		center: fromLonLat([-122.676483, 45.523064]),
		zoom: 10,
	}),
});
