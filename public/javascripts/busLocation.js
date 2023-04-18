"use strict";

//global variable that will allows us to clear the previous bus locations
const dotArr = [];

/**Access bus information and places markers on the map */

function createBuses(){
	//arr to hold the bus markers
	const arr =[];

	//fetch bus locations
	let locs = fastFetch.data.busLocations;

	//access vehicle information	
	let x = locs['resultSet']['vehicle'];

	//fill the array with lat and longitude
	for(let i = 0; i < (x.length); (i+=2)){
		arr.push(locs['resultSet']['vehicle'][i]['latitude']);
		arr.push(locs['resultSet']['vehicle'][i]['longitude']);

		//puts two values in array, hence the i+=2 above
		console.log(arr[i]);
		console.log(arr[i+1]);

		//create circle and add to map
		var circle = L.circle([arr[i], arr[i+1]], {
			color: 'black',
			fillColor: '#000000',
			fillOpacity: 1,
			radius: 30
		}).addTo(map);

		//push circle marker to array
		dotArr.push(circle);
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
	clearBuses(dotArr);
	createBuses(data);
});
