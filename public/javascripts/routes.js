"use strict";

function mappingRoutes(){
	fetchAppXml("https://developer.trimet.org/gis/data/tm_routes.kml", {ll: true},
	function(xml) {

	var placemarkList = xml.querySelectorAll("Placemark")
	console.log(placemarkList);

	var placemark;
	var coordList;
	var coords;
	var extendedData
	//iterate through each placemark
	for (placemark of placemarkList) {
		coordList = placemark.querySelectorAll("coordinates");
		//console.log(coordList);
		extendedData = placemark.querySelectorAll("ExtendedData");
		nameList = extendedData.getElementsByName("type");
		console.log(nameList);

		
		//find coordinates
		for(coords of coordList){
			var finalCoords = [];
			//console.log(coords.textContent);
			coords = coords.textContent;
			const myArray = coords.split(" ");
			//console.log(myArray);

			//splice into final array
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