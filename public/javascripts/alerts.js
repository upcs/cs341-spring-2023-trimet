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

important tags: i = index
json.resultSet.alert[i].route[0].desc
json.resultSet.alert[i].begin (begin is in unix time format)
json.resultSet.alert[i].desc
*/

function  printAlertsTable() {
	fetchAppJson("https://developer.trimet.org/ws/v2/alerts", {alert: true}, 
	function(json) {

		//list of all alerts (idk if there is any specific order)
		var alerts = json.resultSet.alert;
		//route # - transic vehical name, alerts description, start time
		var name = alerts[0].route[0].desc;
		var desc = alerts[0].desc;
		//convert unix to date month year hour min sec;
		var unix = alerts[0].begin;
		//unix conversion courtesy of shomrat/pitust on StackOverflow
		//https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
		//I have commented out the year & sec because they either didn't format right or were unnecessary
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		var a = new Date(unix * 1000);
		//var year = a.getFullYear();
		var month = months[a.getMonth()];
  		var date = a.getDate();
		var hour = a.getHours();
		var min = "0" + a.getMinutes();
		//var sec = "0" + a.getSeconds();
		var time = date + ' ' + month + ' '/* + year + ' '*/ + hour + ':' + min /*+ ':' + sec*/;

		//make table to show the alerts list and give it alert 1 
		//TODO: will cause error if there are zero service alerts
		var table = "<tr><th>" + name + 
					"</th><th>" + time + 
					"</th><th>"+ desc + "</th></tr>";

		/*for (i = 0; i < alerts.length; i++) {
			//get vals
			//route # - transic vehical name, alerts description, start time
			name = alerts[i].route[h].desc;
			//apparently the format varies so this is necessary
			if(alerts[i].route.length > 1){
				for(h = 1; i < alerts[i].route.length; h++){
					name += alerts[i].route[h].desc;
				}
			}

			//create table format
			table += "<tr>"
			table += "<td>" + name + "</td>";
			table += "<td>" + desc + "</td>";
			table += "<td>" + begin + "</td>";
			table += "</tr>";
			console.log(i);
		}*/

		document.getElementById("alerts-table").innerHTML = table;

	}, 
	function(status) {
		console.log("We got an error: " + status);
	});	
}