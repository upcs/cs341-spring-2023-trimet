"use strict";

/*code courtesy of https://alvarotrigo.com/blog/hamburger-menu-css/*/
function menuOnClick() {
	document.getElementById("menu-bar").classList.toggle("change");
	document.getElementById("nav").classList.toggle("change");
	document.getElementById("menu-bg").classList.toggle("change-bg");
}

function on() {
	document.getElementById("overlay").style.display = "block";
}

  function off() {
	document.getElementById("overlay").style.display = "none";
} 

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
