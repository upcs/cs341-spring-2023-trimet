"use strict";

//Called on the minimize/show table button. Changes text on button and either hides or shows the table elemtents.

$("#minimizeBtn").on("click", function() {
	hideLineTable();
});

function hideLineTable() {
	//var last = $.data(txtbox_1, "last");
	if ($('#minimizeBtn').text() == "Minimize Table"){	
		$("#minimizeBtn").text("Show Table");	
		$("#routeSelected").hide();
		$("#searchbar").hide();
		$("#selectedRoute").hide();
		$("#lineTable").hide();
	}
	else{
		$("#minimizeBtn").text("Minimize Table");
		$("#routeSelected").show();
		$("#searchbar").show();
		$("#selectedRoute").show();
		$("#lineTable").show();
	}
}