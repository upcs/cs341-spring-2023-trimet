"use strict";

function mappingRoutes(xml){
	var placemarkList = xml.querySelectorAll("Placemark")

	var placemark;
	var coordList;
	var coords;
	var type;
	

	//iterate through each placemark
	for (placemark of placemarkList) {
		coordList = placemark.querySelectorAll("coordinates");
		type = placemark.querySelector("[name='type'] > value");
		
		type = type.textContent
		
		//find coordinates
		for(coords of coordList){
			var finalCoords = [];
			coords = coords.textContent;
			const myArray = coords.split(" ");

			//splice into final array
			for(let i = 0; i < myArray.length; i++){
				myArray[i] = myArray[i].slice(0,-4);
				const coordArray = myArray[i].split(",");
				finalCoords.push([coordArray[1], coordArray[0]]);
			}

			//var polyline = L.polyline(finalCoords, {color: '#FF00BD'}).addTo(map);
			
			//draw the line
        	//color code

			//red
			if(type == "MAX"){
				var polyline = L.polyline(finalCoords, {color: '#D81B60'}).addTo(map);
			}

			//blue
			if(type == "BUS"){
				var polyline = L.polyline(finalCoords, {color: '#1E88E5'}).addTo(map);
			}

			//yellow
			if(type == "CR"){
				var polyline = L.polyline(finalCoords, {color: '#E0A905'}).addTo(map);
			}

			//green
			if(type == "SC"){
				var polyline = L.polyline(finalCoords, {color: '#00B307'}).addTo(map);
			}

			//pink
			if(type == "BSC"){
				var polyline = L.polyline(finalCoords, {color: '#FF00BD'}).addTo(map);
			}

			//gray
			if(type == "AT"){
				var polyline = L.polyline(finalCoords, {color: '#777777'}).addTo(map);
			}

		}
	}
}

staticFetch.addData("routeCoords",
	() => fetchXml("https://developer.trimet.org/gis/data/tm_routes.kml")
);
  
staticFetch.onFetch(data => {
	mappingRoutes(data.routeCoords);
});
