"use strict";

var dirsTabs = new TabList("routes-dir")
	.bindButtons()

function showRoutesBox(sel) {
	$("#routes-sidebar > *").removeAttr("data-shown");
	$(sel).attr("data-shown", true);
}

function updateDirs(routeNode) {
	dirsTabs.openTab("dir-0");
	$("#dir-chosen").text(routeNode.getAttribute("desc"));

	for (let dirNode of routeNode.children) {
		let dir = dirNode.getAttribute("dir");

		$("#dir-" + dir + "-selector").text(dirNode.getAttribute("desc"));
		let dirElem = $("#dir-" + dir + "-list");
		dirElem.scrollTop(0);

		for (let stopNode of dirNode.children) {
			let buttonElem = $("<button>").text(stopNode.getAttribute("desc"));
			dirElem.append(buttonElem);
		}
	}
}

function updateRouteSearch() {
	let routesElem = $("#routes-list");
	let searchTerm = $("#routes-search").val().trim().toLowerCase();

	for (let buttonElem of routesElem.children()) {
		buttonElem = $(buttonElem);
		let routeName = buttonElem.text().toLowerCase();

		if (routeName.includes(searchTerm)) {
			buttonElem.show();
		} else {
			buttonElem.hide();
		}
	}
}

function updateRoutes(xml) {
	let routesElem = $("#routes-list").empty();

	for (let routeNode of xml.documentElement.children) {
		let buttonElem = $("<button>")
			.text(routeNode.getAttribute("desc"))
			.on("click", (e) => {
				showRoutesBox("#dir-box");
				updateDirs(routeNode);
			});

		routesElem.append(buttonElem);
	}

	updateRouteSearch();
}

$("#routes-search").on("input", (e) => {
	updateRouteSearch();
});

$("#dir-back").on("click", (e) => {
	showRoutesBox("#routes-list-box");
});

new Fetcher(() => {
		return fetchAppXml(
			"https://developer.trimet.org/ws/V1/routeConfig",
			{stops: true, dir: true}
		);
	})
	.on("first", (data) => {
		showRoutesBox("#routes-list-box");
	})
	.on("fetch", updateRoutes)
	.interval(SLOW_FETCH);
