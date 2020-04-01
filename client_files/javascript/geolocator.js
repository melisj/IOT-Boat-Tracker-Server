// Script to be run in a browser to locate the user.
// This will send the latitude and longitude to the server for the hardcoded boat

const gpsForm = document.querySelector("#gps-form");
const gpsStatus = document.querySelector("#gps-status");

gpsForm.addEventListener("submit", getLocation);

var timer;
var waitTimeForNextGPSLocation = 60 * 1000;

// Attemts to request the geolocation data
function getLocation(event) {
    if(event)
        event.preventDefault();
   
    // Set the timer to call it again
    if(timer)
        clearTimeout(timer);
    timer = setTimeout(() => getLocation(null), waitTimeForNextGPSLocation);

    // Set the color of the gps status
    gpsStatus.style.background = "#00ff00";

    if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition(recieveLocation);
}

// Callback function for the geolocator
function recieveLocation(location) {
    console.log(
        "Current Location: " +
        " Latitude: " + location.coords.latitude + 
        " Longitude: " + location.coords.longitude
    );

    storeLocationInDatabase(gpsForm.boat_name.value, location.coords);
}

// Function will call the server with a POST request to store the latest gps info
function storeLocationInDatabase(boatName, coordinates) {
    var ajax = new XMLHttpRequest();
    ajax.open("POST", "/gps", true);

    // Set the header information 
    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    // Wait for respond and print the response
    ajax.onreadystatechange = () => {
        if(ajax.readyState == 4) {
            if((ajax.status >= 200 && ajax.status <= 400))
                console.log(ajax.responseText);
            else
                console.log("Ajax request has failed");
        }
    };

    // Send info
    ajax.send("boat_name=" + boatName + "&latitude=" + coordinates.latitude + "&longitude=" + coordinates.longitude);
}