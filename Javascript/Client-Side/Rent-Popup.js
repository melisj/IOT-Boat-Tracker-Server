// Script for maintaining the state of the popup for renting a boat.
// This script can toggle the state of the popup and will send out the form in a post request.

// Cache button that was selected
var selectedTimeButton;
var selectedTimeButtonLastColor;
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
		clickedButtonIdentifiers = clickedButton.classList;

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
	if(selectedTimeButton){
		// Save the last known color
		if(!popupVisible)
			selectedTimeButtonLastColor = selectedTimeButton.style.background;
		// Set the color
		selectedTimeButton.style.background = popupVisible ? selectedTimeButtonLastColor : "black";
	}

	// Start getting the location of the boat
	if(!popupVisible && clickedButton)
		startRequestingLocation(clickedButtonIdentifiers[2]); // Returns boat name
	else
		stopTimeOutValue();

	// Check if the user clicked on a route that is busy
	if(!popupVisible && clickedButtonIdentifiers.contains(reservedTag)) {
		// Get the name and get the begin time after the slash
		getSelectedRoute(clickedButtonIdentifiers[2], clickedButton.className.split("/")[1]);
	}
}

// Send the route back to the server
function sendRouteRequest(event) {
	event.preventDefault();

	if(selectedTimeButton.classList.contains(reservedTag)) {
		alert("Boat is already reserved at this time");
		return;
	}

	var rentInfo = {
		boat_name: selectedTimeButton.classList[2], // Returns third class name
		begin_time: form.begin_time.value,
		end_time: form.end_time.value
	};

	var ajax = new XMLHttpRequest();
	
	ajax.open("POST", "/client/sendroute", true);

	// Set the header information 
	ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	ajax.onreadystatechange = () => {
		if(ajax.readyState == 4) {
			alert(ajax.status == 201 ? "Route has been processed" : "Route processing has failed (cant overwrite route)");
			getAllRoutesForToday();
		}
	};

	ajax.send("boat_name=" + rentInfo.boat_name + "&begin_time=" + rentInfo.begin_time + "&end_time=" + rentInfo.end_time);
}


// Get the selected route from the database
function getSelectedRoute(boatName, beginTime) {
	resetRouteLine();

	setTimeout(() => {
		doRequestForData((result) => {
			result.forEach(coordinate => {
				updateRouteLine(coordinate.latitude, coordinate.longitude);
			});
		}, "/client/completeroute?boat_name=" + boatName + "&begin_time=" + beginTime);
	}, 200)
}
