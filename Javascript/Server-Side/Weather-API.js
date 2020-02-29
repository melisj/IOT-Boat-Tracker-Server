// See "https://darksky.net/dev/docs" for more information
const WEATHER_API_KEY = "e94b13f285d0fd959ed2af9453213e3f";
const DEFAULT_WEATHER_API_URL = "https://api.darksky.net/forecast/" + WEATHER_API_KEY + "/";
const DEFAULT_EXCLUDE_WEATHER_DATA = "?exclude=minutly,daily,flags,alert";
const DEFAULT_METRICS = "&si";

const https = require("https");
const EventEmitter = require('events');
const geolocation = require("../Client-Side/Geolocator.js");
const hoursForecast = 2;
const dataRetrievedEvent = new EventEmitter();
module.exports = dataRetrievedEvent;

// Send a request to the Dark Sky Weather API with the correct coordinates
function doWeatherRequestForLocation() {
    var coordinates = {
        latitude: 54,
        longitude: 5
    };
    // Construct the url
    var completeUrl = 
    DEFAULT_WEATHER_API_URL + 
    coordinates.latitude + "," + coordinates.longitude + 
    DEFAULT_EXCLUDE_WEATHER_DATA + DEFAULT_METRICS;


    https.get(completeUrl, (response) => {
        
        console.log('HTTPS Status:', response.statusCode);

        // Recieve the data
        var completeData = '';
        response.on("data", (data) => completeData += data);
        response.on("end", () => weatherRequestComplete(completeData));

    // Report error when connection failed
    }).on("error", (error) => {
        console.log(error);
    });
}


function weatherRequestComplete(data) {
    var jsonData = JSON.parse(data);
    dataRetrievedEvent.emit("recieved", jsonData);
}

function getLocationFromDatabase() {
    
}

// Export the weather request function
module.exports.requestWeather = doWeatherRequestForLocation;