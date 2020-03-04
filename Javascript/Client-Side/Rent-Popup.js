// Script for maintaining the state of the popup for renting a boat.
// This script can toggle the state of the popup and will send out the form in a post request.

// Cache button that was selected
var selectedTimeButton;
var popupVisible;

const form = document.getElementById("rent_form");
const popup = document.getElementById("popup");
const beginTimeInputField = document.getElementById("rent_form_begin_time");

form.addEventListener("submit", sendRouteRequest);

// Function to show popup
function togglePopup(fromButton) {
	popupVisible = popup.style.display == "block";

	// Set the button when the popup is not visible
	if(!popupVisible) {
		selectedTimeButton = fromButton;
		var beginTime = fromButton.className.split(" ")[1]; // Returns second class name
		beginTimeInputField.value = beginTime; 
	}

	// Set the visibility
	popup.style.display = popupVisible ? "none" : "block";

	// Set visuals of the time button pressed
	selectedTimeButton.style.background = popupVisible ? "#aaaaaa" : "red";
}


function sendRouteRequest(event) {
	event.preventDefault();

	var rentInfo = {
		boat_name: selectedTimeButton.className.split(" ")[2], // Returns third class name
		begin_time: form.begin_time.value,
		end_time: form.end_time.value
	};

	var ajax = new XMLHttpRequest();
	
	ajax.open("POST", "/client/sendroute", true);

	// Set the header information 
	ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	ajax.send("boat_name=" + rentInfo.boat_name + "&begin_time=" + rentInfo.begin_time + "&end_time=" + rentInfo.end_time);
}

