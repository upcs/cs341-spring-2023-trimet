import Map from "/ol/Map.js";
import XYZ from "/ol/source/XYZ.js";
import TileLayer from "/ol/layer/Tile.js";
import View from "/ol/View.js";
import {fromLonLat} from "/ol/proj.js";

const map = new Map({
	target: "map",
	layers: [
		new TileLayer({
			source: new XYZ({
				url: "https://tiles.trimet.org/styles/trimet/{z}/{x}/{y}.png"
			}),
		}),
	],
	view: new View({
		center: fromLonLat([-122.676483, 45.523064]),
		zoom: 10,
	}),
});
