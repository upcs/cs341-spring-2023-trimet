"use strict";

function mappingRoutes(){
	fetchAppXml("https://developer.trimet.org/gis/data/tm_routes.kml", {routes:true},
	function(xml) {

		var xmlDoc = xml.documentElement;
		var routes = xmlDoc.getElementsByTagName("Placemark");
	
		var temp;
		var tempCoords;
		var coords;
		var typeTemp;
		var type;
		var i = 0;
		//we know how many stops there are
		for (i = 0; i < 193; i++) {
	
			temp = routes[i].getElementsByTagName("MultiGeometry")[0];
			//tempCoords = temp.getElementsByTagName("coordinates")[0];
			console.log("coords: " + temp.textContent);
		
	
			//add coords to map
	
			/*
			//red
			if(type.textContent == "MAX"){
				var circle = L.circle([myArray[1], myArray[0]], {
					color: '#E11845',
					fillColor: '#E11845',
					fillOpacity: 1,
					radius: 5
				}).addTo(map);
			}
	
			//blue
			if(type.textContent == "BUS"){
				var circle = L.circle([myArray[1], myArray[0]], {
					color: '#0057E9',
					fillColor: '#0057E9',
					fillOpacity: 1,
					radius: 5
				}).addTo(map);
			}
	
			//purple
			if(type.textContent == "CR"){
				var circle = L.circle([myArray[1], myArray[0]], {
					color: '#8931EF',
					fillColor: '#8931EF',
					fillOpacity: 1,
					radius: 5
				}).addTo(map);
			}
	
			//yellow
			if(type.textContent == "SC"){
				var circle = L.circle([myArray[1], myArray[0]], {
					color: '#F2CA19',
					fillColor: '#F2CA19',
					fillOpacity: 1,
					radius: 5
				}).addTo(map);
			}
	
			//green
			if(type.textContent == "BSC"){
				var circle = L.circle([myArray[1], myArray[0]], {
					color: '#87E911',
					fillColor: '#87E911',
					fillOpacity: 1,
					radius: 5
				}).addTo(map);
			}
	
			//pink
			if(type.textContent == "AT"){
				var circle = L.circle([myArray[1], myArray[0]], {
					color: '#FF00BD',
					fillColor: '#FF00BD',
					fillOpacity: 1,
					radius: 5
				}).addTo(map);
			}*/
	
		}
	
	},
	function(status) {
		console.log("mappingStops.js error: " + status);
	});
}

mappingRoutes();