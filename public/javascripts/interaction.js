"use strict";

// Show relevant dialog boxes when the information links in the header are
// clicked.
$("#info-how-to").on("click", e => {
	new Dialog("How-To")
		.add($template("tem-how-to"))
		.accept()
		.show();
});

$("#info-service-alerts").on("click", e => {
	new Dialog("Service Alerts")
		.text("Not implemented")
		.button("Waah, I'm so sad!")
		.show();
});

$("#info-about").on("click", e => {
	new Dialog("About")
		.add($template("tem-about"))
		.accept()
		.show();
});

// Make our tab controller for the sidebar tabs.
var sidebarTabs = new TabList("sidebar")
	.bindButtons()
	.openTab("routes");
