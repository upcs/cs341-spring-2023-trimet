"use strict";

function createBuses(){
	console.log("Hi");
	console.log(fastFetch.data.busLocations);
}

//The locations should be updated oftern 
fastFetch.addData("busLocations",
	() => fetchAppJson("https://developer.trimet.org/ws/v2/vehicles")
);

staticFetch.onFetch(data => {
	createBuses(data);
});
