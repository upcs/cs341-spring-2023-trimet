"use strict";

const dotArr = [];

function createBuses(){
	const arr =[];

	let locs = fastFetch.data.busLocations;
	
	let x = locs['resultSet']['vehicle'];

	for(let i = 0; i < (x.length); (i+=2)){
		arr.push(locs['resultSet']['vehicle'][i]['latitude']);
		arr.push(locs['resultSet']['vehicle'][i]['longitude']);

		console.log(arr[i]);
		console.log(arr[i+1]);

		var circle = L.circle([arr[i], arr[i+1]], {
			color: 'black',
			fillColor: '#000000',
			fillOpacity: 1,
			radius: 30
		}).addTo(map);

		dotArr.push(circle);
	}

}
	
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
