// This module will return 3 values which can all have a value of 0, 1 or 2.
// Each value represents a different weather state.
// 0 = no warning, 1 means there is a chance of this weather type, 2 there is high probability of this type of weather

// See "https://darksky.net/dev/docs" for more information
const WEATHER_API_KEY = "e94b13f285d0fd959ed2af9453213e3f";
const DEFAULT_WEATHER_API_URL = "https://api.darksky.net/forecast/" + WEATHER_API_KEY + "/";
const DEFAULT_EXCLUDE_WEATHER_DATA = "?exclude=minutly,daily,flags,alert";
const DEFAULT_METRICS = "&si";

const https = require("https");
const EventEmitter = require('events');
const fileManager = require("../file_manager");
const httpUtil = require("../utils/http_util");
const hoursForecast = 2;
const dataRetrievedEvent = new EventEmitter();

// Weather interpret data (chance of rain in percentage)
const rainChanceMaybe = 0.40;
const rainChangeHighProbability = 0.70;
// Data regarding the intesity of the rain (mm in a hour) source: https://en.wikipedia.org/wiki/Rain#Intensity
const rainAmountLight = 2;
const rainAmountHeavy = 7;
// windspeed variables
const windSpeedHeavy = 70; 
const windSpeedDangerous = 100;


function checkWeatherForBoat(boatName) {
    var coordinates = fileManager.loadLocationCache(boatName);

    if(coordinates != null)
        doWeatherRequestForLocation(coordinates);
    // Request failed
    else
        dataRetrievedEvent.emit("recieved", "", httpUtil.BAD_REQUEST);
}

// Send a request to the Dark Sky Weather API with the correct coordinates
function doWeatherRequestForLocation(coordinates) {
    // Construct the url
    var completeUrl = 
    DEFAULT_WEATHER_API_URL + 
    coordinates.latitude + "," + coordinates.longitude + 
    DEFAULT_EXCLUDE_WEATHER_DATA + DEFAULT_METRICS;

    // Do a get request for the weather
    https.get(completeUrl, (response) => {
        
        if(response.statusCode == 200){
            // Recieve the data
            var completeData = '';
            response.on("data", (data) => completeData += data);
            response.on("end", () => weatherRequestComplete(completeData, response.statusCode));
        }

    // Report error when connection failed
    }).on("error", (error) => {
        console.log(error);
    });
}

// Callback for the weather request, process it and send it to the server file
// Function will return an object with 3 values
// Each value represents an led index on the arduino (0 = no light, 1 = yellow, 2 = red)
function weatherRequestComplete(data, httpStatus) {
    var jsonData = JSON.parse(data).hourly.data[0];
    console.log(jsonData);

    var precipProbability = jsonData.precipProbability;
    var precipIntensity = jsonData.precipIntensity;
    var windspeed = jsonData.windGust;

    // Rainchance 0 = nearly no chance, 1 = maybe, 2 is high chance
    var rainChance = precipProbability >= rainChangeHighProbability ? 2 : precipProbability >= rainChanceMaybe ? 1 : 0; 

    var returnObject = {
        lightRain: precipIntensity >= rainAmountLight ? rainChance : 0,
        heavyRain: precipIntensity >= rainAmountHeavy ? rainChance : 0,
        heavyWind: windspeed >= windSpeedDangerous ? 2 : windspeed >= windSpeedHeavy ? 1 : 0
    };

    console.log(returnObject);

    dataRetrievedEvent.emit("recieved", returnObject, httpStatus);
}

// Export the weather request and recieve event
module.exports = dataRetrievedEvent;
module.exports.requestWeather = checkWeatherForBoat;