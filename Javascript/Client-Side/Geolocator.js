// Script to be run in a browser to locate the user.
// This will send the latitude and longitude to the server for the hardcoded boat

// TODO hardcode boat

// Attemts to request the geolocation data
function getLocation() {
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

    storeLocationInDatabase(location.coords);
}

// Function will call the server with a POST request to store the latest gps info
function storeLocationInDatabase(coordinates) {
    var ajax = new XMLHttpRequest();
    ajax.open("POST", "/", true);

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
    ajax.send("latitude=" + coordinates.latitude + "&longitude=" + coordinates.longitude);
}