function exitAlertsOnClick() {
	$('#alerts-window').hide();
}
function alertsPopupOnClick() {
	$('#alerts-window').show();
	$('#how-to-window').hide();
	$('#about-window').hide();
}

function howToPopupOnClick(){
	$('#how-to-window').show();
	$('#alerts-window').hide();
	$('#about-window').hide();
}

function exitHowToOnClick(){
	$('#how-to-window').hide();
}

function aboutPopupOnClick(){
	$('#about-window').show();
	$('#how-to-window').hide();
	$('#alerts-window').hide();
}

function exitAboutOnClick(){
	$('#about-window').hide();
}
