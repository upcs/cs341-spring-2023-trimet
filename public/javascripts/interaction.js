"use strict";

// Show relevant dialog boxes when the information links in the header are
// clicked.
$("#info-how-to").on("click", e => {
	new Dialog("How-To")
		.add($template("tem-how-to"))
		.accept()
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
	.showTab("routes");

// Make a loading message that we hide once the static data is loaded.
var loadingMessage = new Message()
	.add($template("tem-loading-message"))
	.show();

staticFetch.onFetch(data => {
	loadingMessage.hide();
});

// Hook into the `fetchData()` function to show a message bar on failure.
var fetchMessage = new Message()
	.button("Retry", undefined, false);

onFetchSuccess = function() {
	// On successful fetch, hide the message.
	fetchMessage.hide();
}

onFetchFailure = function(err) {
	// On a fetch that failed, change the message's text to a descriptive error
	// message and show it.
	let messageText = err.category === "timeout" ?
		"Fetching data from the server took too long." :
		"Unable to establish connection to the server.";

	fetchMessage.clear().text(messageText).show();
}
