"use strict";

//Interacts with minimize/show button. Changes text on button and either hids or shows.

$("#minimizeBtn").on("click", function() {
	hideLineTable();
});

function hideLineTable() {
	//var last = $.data(txtbox_1, "last");
	if ($('#minimizeBtn').text() == "Minimize Table"){	
		$("#minimizeBtn").text("Show Table");
		$("#lineTable").hide();
	}
	else{
		$("#minimizeBtn").text("Minimize Table");
		$("#lineTable").show();
	}
}