"use strict";

function exitAlertsOnClick() {
	$('#alerts-window').hide();
	console.log("Alerts window closed");
}

function alertsPopupOnClick() {
	$('#alerts-window').show();
	console.log("Alerts window popped up");
}

/*
formatting of the Json file for each alert

generic-ification key:
# = numbers
true/false = true or false not both
? = means that this is likely an option but was not in my alerts sample
text = some string goes here
:(anything here without ?) = means that all this but may not be true for all alerts ever i.e. :null
"" = nothing was in these quotes but there may be in future alerts idk

{"resultSet":{"alert":[{
	"route":[{
		"routeColor":"#",
		"frequentService":true/false,
		"route":#, "no_service_flag":true/flase,
		"routeSubType":"Bus/Light Rail/MAX?",
		"id":#,
		"type":"B/R/?",
		"desc":"text",
		"routeSortOrder":#
	}],
	"info_link_url":null,
	"end":null,
	"system_wide_flag":false,
	"location":[{
		"lng":#,
		"no_service_flag":ture/false,
		"passengerCode":"E/?"
		"id":#,
		"dir":"text",
		"lat":#,
		"desc":"text",
	}],
	"id":#,"header_text":"",
	"begin":#,
	"desc":"text"
}

important tags: i = index, 0 is by default but not always correct
json.resultSet.alert[i].route[0].desc
json.resultSet.alert[i].begin (begin is in unix time format)
json.resultSet.alert[i].desc
*/

function  printAlertsTable() {
	fetchAppJson("https://developer.trimet.org/ws/v2/alerts", {alert: true}, 
	function(json) {

		//list of all alerts (idk if there is any specific order)
		var alerts = json.resultSet.alert;
		//make table to show the alerts list
		var table = "<table class='style-table'>" + 
					"<tr>" +
					"<th>Route Name</th><th style='min-width: 15ch;'>Time</th><th>Description</th>" + 
					"</tr>";
					//don't </table> cause we will add more rows and cells in the for loop
		//for the unix to timestamp conversion
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

		//comment out this for loop to just print the first alert
		for (var i = 0; i < alerts.length; i++) {
			//apparently the format varies so this is necessary
			var name = "";//reset name
			if(alerts[i].route.length > 0){//TODO: this is always false
				//route #/name - transit vehical name
				for(var h = 0; h < alerts[i].route.length; h++){
					name += alerts[i].route[h].desc;
				}
			}
			//alert description
			var desc = alerts[i].desc;
			//alert active at date/time
			var unix = alerts[i].begin;
			//unix conversion from shomrat/pitust on StackOverflow
			//https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
			var date = new Date(unix * 1000);
			//if getMin is nums 0-9 then print it out like this 00-09
			var min;
			var hour;
			var am = true;//when false it is pm
			if(date.getMinutes() < 10){
				min = '0' + date.getMinutes();
			}
			if(date.getHours() == 0){
				hour = 12;
				am = true;
			} else if(date.getHours() < 10){
				hour = date.getHours();
				am = true;
			}//if single digit add leading '0'
			if(date.getHours() > 12){
				hour = date.getHours() - 12;
				am = false;//as in it is pm
			}//convert to am/pm from 24 hr format
			var time = date.getDate() + ' ' + 
					months[date.getMonth()] + ' '+ 
					hour + ':' + 
					min;
			//add am/pm to end of time
			if(am){
				time += " am";
			} else {
				time += " pm";
			}

			//create table format
			table += "<tr class='style-table'>"
			table += "<td>" + name + "</td>";
			table += "<td style='min-width: 15ch;'>" + time + "</td>";
			table += "<td>" + desc + "</td>";
			table += "</tr>";
		}

		table += "</table>";

		new Dialog("Service Alerts")
			.add($html(table))
			.accept()
			.show();

	}, 
	function(status) {
		console.log("We got an error: " + status);
	});	
}