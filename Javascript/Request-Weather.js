// See "https://darksky.net/dev/docs" for more information
const WEATHER_API_KEY = "e94b13f285d0fd959ed2af9453213e3f";
const DEFAULT_WEATHER_API_URL = "https://api.darksky.net/forecast/" + WEATHER_API_KEY + "/";
const DEFAULT_EXCLUDE_WEATHER_DATA = "?exclude=minutly,daily,flags,alert";
const DEFAULT_METRICS = "&si";

var hoursForecast;

// Function to call when you want to make a weather request for current location
function GetWeatherInfo(hours) {
    hoursForecast = hours;
    GetLocation();
}

// Attemts to request the geolocation data
function GetLocation() {
    if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition(RecieveLocation);
}

// Callback function for the geolocator
function RecieveLocation(location) {
    console.log(
        "Current Location: " +
        " Latitude: " + location.coords.latitude + 
        " Longitude: " + location.coords.longitude
    );

    DoWeatherRequestForLocation(location.coords);
}

// Send a request to the Dark Sky Weather API with the correct coordinates
function DoWeatherRequestForLocation(coordinates) {
    // Setup for ajax request
    var ajax = new XMLHttpRequest(); 

    var completeUrl = 
    DEFAULT_WEATHER_API_URL + 
    coordinates.latitude + "," + coordinates.longitude + 
    DEFAULT_EXCLUDE_WEATHER_DATA + DEFAULT_METRICS;
    
    ajax.onreadystatechange = (e) => { 
        if(this.status == "200" && this.readyState == "4") 
            RecieveWeatherRequest(e);
    }; 

    ajax.open("GET", completeUrl);
    ajax.send();
}

function RecieveWeatherRequest(e) {
    console.log(e);
}
