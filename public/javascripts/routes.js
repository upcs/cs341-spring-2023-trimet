"use strict";

function mappingRoutes(){
	fetchAppXml("https://developer.trimet.org/gis/data/tm_routes.kml", {ll: true},
	function(xml) {

	var placemarkList = xml.querySelectorAll("Placemark")
	//console.log(placemarkList);

	var placemark;
	var coordList;
	var coords;
	//we know how many stops there are
	for (placemark of placemarkList) {
		coordList = placemark.querySelectorAll("coordinates");
		//console.log(coordList);
		for(coords of coordList){
			var finalCoords = [];
			//console.log(coords.textContent);
			coords = coords.textContent;
			const myArray = coords.split(" ");
			//console.log(myArray);
			for(let i = 0; i < myArray.length; i++){
				myArray[i] = myArray[i].slice(0,-4);
				//console.log(myArray[i]);
				const coordArray = myArray[i].split(",");
				finalCoords.push([coordArray[1], coordArray[0]]);
			}
			console.log(finalCoords);
			var polyline = L.polyline(finalCoords, {color: 'red'}).addTo(map);
		}
		
	}

	},
	function(status) {
		console.log("mappingRoutes.js error: " + status);
	});

}

mappingRoutes();