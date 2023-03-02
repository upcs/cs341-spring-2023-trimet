// Frankly, this is hacky. It would be nice if we could import in a nicely
// structured manner, but it doesn't seem to be possible given the way
// OpenLayers is structured.
import Map from "/ol/Map.js";
import View from "/ol/View.js";
import TileLayer from "/ol/layer/Tile.js";
import * as proj from "/ol/proj.js";
import XYZ from "/ol/source/XYZ.js";

// To make the ol variable global, we can't use the var keyword since this is a
// module file. Instead, we manually put it into the window, which is where
// global variables actually reside. Then it becomes accessible everywhere.
window.ol = {}
ol.Map = Map
ol.View = View

ol.layer = {}
ol.layer.TileLayer = TileLayer

ol.proj = proj

ol.source = {}
ol.source.XYZ = XYZ
