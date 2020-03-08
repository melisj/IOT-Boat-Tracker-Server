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
function togglePopup(forceVisibilityTo = null, clickedButton = null) {
	popupVisible = popup.style.display == "block";
	var clickedButtonIdentifiers;

	// Get all the identifiers from the button clicked
	if(clickedButton)
		clickedButtonIdentifiers = clickedButton.className.split(" ");

	// Force the state for onload event
	if(forceVisibilityTo != null)
		popupVisible = forceVisibilityTo;

	// Set the button when the popup is not visible
	if(!popupVisible && clickedButton) {
		selectedTimeButton = clickedButton;
		var beginTime = clickedButtonIdentifiers[1]; // Returns time id
		beginTimeInputField.value = beginTime; 
	}

	// Set the visibility
	popup.style.display = popupVisible ? "none" : "block";

	// Set visuals of the time button pressed
	if(selectedTimeButton)
		selectedTimeButton.style.background = popupVisible ? "#aaaaaa" : "black";

	// Start getting the location of the boat
	if(!popupVisible && clickedButton)
		startRequestingLocation(clickedButtonIdentifiers[2]); // Returns boat name
	else
		stopTimeOutValue();
}

// Send the route back to the server
function sendRouteRequest(event) {
	event.preventDefault();

	alert("route has been send");

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

