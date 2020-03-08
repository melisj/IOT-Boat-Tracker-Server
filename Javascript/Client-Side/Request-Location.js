const markerScript = document.querySelector("#currentLocation");
const availableStatus = document.querySelector("#available");
var waitTimeForNewRequest = 5 * 1000;
var timer;

// Start getting the location of the boat
function startRequestingLocation(boatName) {
	doRequestForData((markerData) => {
		// Update the marker with a new location
		updateMarker(0, 0);
		if(markerData != null)
			updateMarker(markerData.latitude, markerData.longitude);
		
		timer = setTimeout(() => startRequestingLocation(boatName), waitTimeForNewRequest);

		// Do request for boat status
		doRequestForData((boatStatus) => {
			if(markerData != null)
				availableStatus.style.background = boatStatus ? "red" : "green";
			else
				availableStatus.style.background = "yellow";
		}, "/client/boatstatus?boat_name=" + boatName);

	}, "/client/boatlocation?boat_name=" + boatName);

	
}


// Stop the time out for a function so it would not be called by accident
function stopTimeOutValue() {
    clearTimeout(timer);
	ajax.onreadystatechange = null;
}