// Script managing the file retrieval from the server.
// When a requested file could not be found, there will be searched in the standard html path.
// This will also handle the gps cache with the Json file

const fs = require("fs");
const httpUtil = require("./Utils/Http");

// Json file location
const jsonPath = "./Server-Files/Resources/Caching.json";

// Load a file from the root of the server
function loadFile(path, response) {
    // Default message for the server
    var file;

    // Get the path as requested
    try {
        file = fs.readFileSync(path);
    }
    // If that doesnt work, try to get the html path
    catch(error) {
        file = loadHtmlFileFallback(path);
    }-

    httpUtil.endResponse(response, file ? httpUtil.OK : httpUtil.NOT_FOUND, file);
}

// Function to fall back to when a file was not found
// Function will try to return a html file in the HTML folder
function loadHtmlFileFallback(path) {
    var file

    // Add html to the path
    try { file = fs.readFileSync("Client-Files/HTML/" + path + ".html"); }
    catch(error) { console.error(error);}

    return file;
}

// Save the gps object in the json file
function saveToJsonCache(gpsObject) {
    var lastLocations = JSON.parse(fs.readFileSync(jsonPath));

    try {
        // Update the boat in the cache
        lastLocations.boats[0][gpsObject.boat_name].latitude = gpsObject.latitude
        lastLocations.boats[0][gpsObject.boat_name].longitude = gpsObject.longitude
    }
    catch(error) {
        // Add the boat to the cache
        var boatJson = "{\"" + gpsObject.boat_name + "\": {\"latitude\": \"" + gpsObject.latitude + "\", \"longitude\": \"" + gpsObject.longitude + "\"}}"
        lastLocations.boats.push(JSON.parse(boatJson));    
    }

    fs.writeFileSync(jsonPath, JSON.stringify(lastLocations));
}

// Load a json file to get the last known location
function loadJsonCache(boatName, response = null) {
    var lastLocations = JSON.parse(fs.readFileSync(jsonPath));
    var lastLocationBoat;

    try {
        if(lastLocations.boats[0][boatName])
            lastLocationBoat = lastLocations.boats[0][boatName];
        if(response)
            httpUtil.endResponse(response, httpUtil.OK, JSON.stringify(lastLocationBoat));
    }
    catch(error) {
        console.log("no known location for: " + boatName);
        if(response)
            httpUtil.endResponse(response, httpUtil.NO_CONTENT, "no known location for: " + boatName);
    }

    return lastLocationBoat;
}

module.exports.loadFile = loadFile;
module.exports.saveLocationCache = saveToJsonCache;
module.exports.loadLocationCache = loadJsonCache;