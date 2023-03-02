/*
function printBlueTable() {
	fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {stops: true, dir: true}, function(xml) {
		var i;
		var xmlDoc = xml.documentElement;
		var dest = xmlDoc.getElementsByTagName("dir");
		var dest0Stops = dest[0].getElementsByTagName("stop");
		var dest1Stops = dest[1].getElementsByTagName("stop");
		var table = "<tr><th>" + dest[0].getAttribute("desc") + "</th><th>"
		+ dest[1].getAttribute("desc") + "</th></tr>";

		for (i = 0; i < dest0Stops.length; i++) {
			table += "<tr><td>" + dest0Stops[i].getAttribute("desc") + "</td>";
			table += "<td>" + dest1Stops[i].getAttribute("desc") + "</td></tr>";

		}

		document.getElementById("blueLine").innerHTML = table;

	}, function(status) {
    	console.log("We got an error: " + status);
	});	
}

function  printRedTable() {
	fetchAppXml("https://developer.trimet.org/ws/V1/routeConfig", {stops: true, dir: true}, function(xml) {
		var i;
		var xmlDoc = xml.documentElement;
		var dest = xmlDoc.getElementsByTagName("dir");
		var dest2Stops = dest[2].getElementsByTagName("stop");
		var dest3Stops = dest[3].getElementsByTagName("stop");
		var table = "<tr><th>" + dest[2].getAttribute("desc") + "</th><th>"
		+ dest[3].getAttribute("desc") + "</th></tr>";

	for (i = 0; i < dest2Stops.length; i++) {
			table += "<tr><td>" + dest2Stops[i].getAttribute("desc") + "</td>";
			table += "<td>" + dest3Stops[i].getAttribute("desc") + "</td></tr>";

		}

		document.getElementById("redLine").innerHTML = table;

	}, function(status) {
		console.log("We got an error: " + status);
	});	
}
*/

