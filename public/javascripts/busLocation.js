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

	//creates basic icon
	var transitIcon = L.Icon.extend({
		options: {
			iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/directions-transit-1782211-1512761.png',
			iconSize: [20, 20]
		}
	});

	//fill the array with lat and longitude
	for(let i = 0; i < (x.length); (i++)){
		var stopId;
		if(locs['resultSet']['vehicle'][i]['routeNumber'] == id){
			
			//create icon and add to map
			var ic = new transitIcon({iconSize: [20, 20]});
			var liveMarker = L.marker([locs['resultSet']['vehicle'][i]['latitude'], locs['resultSet']['vehicle'][i]['longitude']], {
				icon: ic
			}).addTo(map);

			//adjust icon to zoom
			var actualZoom = map.getZoom();
			if(actualZoom < 14){
				var newSize = (actualZoom + 15);
			}else{
				var newSize = (actualZoom + 3)*2;
			}
			//set resized icon
			var resizedIcon = new transitIcon({iconSize: [newSize, newSize]});      
			liveMarker.setIcon(resizedIcon);

			//push icon to array
			dotArr.push(liveMarker);

			//iterates through stops to determine which stop matches
			//next locationID
			for(let stop of stopsByOrder){
				if(stop.id == locs['resultSet']['vehicle'][i]['nextLocID']){
					stopId = stop.desc;	
				}
			}

			//enables mousover functionalities to display data
			liveMarker.bindPopup(locs['resultSet']['vehicle'][i]['signMessageLong'] + "<br> Next Stop: " + stopId);
			liveMarker.on('mouseover', function (e){
				this.openPopup();
			});
			liveMarker.on('mouseout', function (e){
				this.closePopup();
			});

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
	}
});
