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

function storeLocationInDatabase(coordinates) {

}