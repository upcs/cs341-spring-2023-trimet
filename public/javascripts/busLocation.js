"use strict";

//global variable that will allows us to clear the previous bus locations
const dotArr = [];

/**
 * Access bus information and places markers on the map 
*/
function createBuses(id){

	//fetch bus locations
	let locs = fastFetch.data.busLocations;

	//access vehicle information	
	let x = locs['resultSet']['vehicle'];

	//fill the array with lat and longitude
	//puts two values in array, hence the i+=2 above
	for(let i = 0; i < (x.length); (i++)){
		if(locs['resultSet']['vehicle'][i]['routeNumber'] == id){
			//create circle and add to map
			var circle = L.circle([locs['resultSet']['vehicle'][i]['latitude'], locs['resultSet']['vehicle'][i]['longitude']], {
				color: 'black',
				fillColor: '#000000',
				fillOpacity: 1,
				radius: 30
			}).addTo(map);

			//push circle marker to array
			dotArr.push(circle);
		}
	}

}

/** Remove markers from array to clear prev locations */
function clearBuses(arr){
	for(let i = 0; i < (arr.length); i++){
		arr[i].remove();
	}
}

//The locations should be updated oftern 
fastFetch.addData("busLocations",
	() => fetchAppJson("https://developer.trimet.org/ws/v2/vehicles")
);

fastFetch.onFetch(data => {
	const arr = [];

	clearBuses(dotArr);
	for(let routes of routesByOrder){
		if(routes.selected || routes.pinned){
			arr.push(routes.id);
		}
	}
	for(let id of arr){
		createBuses(id);
		console.log(id);
	}
});
