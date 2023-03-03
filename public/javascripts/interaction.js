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