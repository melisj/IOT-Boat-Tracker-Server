// Script to maintain all the incoming location data from the GPS

const dbCore = require("./Database-Essentials");
const timestamp = require("./Utils/Timestamp");
const fileManager = require("./File-Manager");
const dbRoute = require("./Route-Database");
const httpUtil = require("./Utils/Http");

// Queries
const updateBoatLocation = "UPDATE boat SET ";
const getBoatInfo = "SELECT `name` FROM boat";
const addNewLocationToRoute = "INSERT INTO geolocation (time, route_begin_time, route_boat_name, latitude, longitude) VALUES (";

// Function for storing a new calibrated location for the specified boat
function calibrateBaseLocation(boatName, response) {
    var newLocation = fileManager.loadLocationCache(boatName);

    // Complete the query
    var completeQuery = updateBoatLocation + 
    "base_latitude = '" + newLocation.latitude + 
    "', base_longitude = '" + newLocation.longitude +
    "' WHERE name = '" + boatName + "';"; 

    // Query to the database
    dbCore.doQuery(completeQuery, (result) => {
        // End the http request
        httpUtil.endResponse(response, 
            result ? httpUtil.CREATED : httpUtil.INTERNAL_ERROR, 
            result ? "succeeded" : "error");
    });
}

// Update the current location for a specific boat
function updateCurrentLocation (boatName, gpsObject) {
    var completeQuery = updateBoatLocation + 
    "cur_latitude = '" + gpsObject.latitude + 
    "', cur_longitude = '" + gpsObject.longitude +
    "' WHERE name = '" + boatName + "';"; 

    // Query to the database
    dbCore.doQuery(completeQuery);
} 

// Add a new location object to a route (from gps)
function addLocationObject(boatName, beginTime, latitude, longitude) {
    var completeQuery = addNewLocationToRoute +
    " '" + timestamp.createTimestampSQL() + "'" +
    ", '" + timestamp.createTimestampSQLInput(beginTime) + "'" +
    ", '" + boatName + "'" +
    ", " + latitude + 
    ", " + longitude +
    ");"; 

    // Query to the database
    dbCore.doQuery(completeQuery);
}

// Function for the front end to collect all the reserved boats
function getAllRouteInfo() {

}

// Retrieve all the boats in the database
function getAllBoatInfo(response) {
    dbCore.doQuery(getBoatInfo, (result) => {
        httpUtil.endResponse(response, result ? httpUtil.OK : httpUtil.INTERNAL_ERROR, JSON.stringify(result));
    });
}

// Recieve an gps location from a boat and store it appropriately
function recieveGpsLocation(boatName, gpsObject, response) {
    try {
        // Store the position in the cache
        fileManager.saveLocationCache(boatName, gpsObject);
        // Store it in the database in the cur position of the boat
        updateCurrentLocation(boatName, gpsObject);

        // Make a call for checking if the boat has already been returned or has left the base
        dbRoute.hasRouteStarted(boatName);

        // Check what route reservation is active right now
        dbRoute.routeCheck.on("done", (result, timeResult) => {
            // End the connection when it failed
            if(result && timeResult)
                httpUtil.endResponse(response, httpUtil.NO_CONTENT);

            var boatLeft = result[0].left;
            var boatReturned = result[0].returned;

            // Check if the boat is gone (from database)
            if(boatReturned == 0 && boatLeft == 1) {
                addLocationObject(boatName, timeResult, gpsObject.latitude, gpsObject.longitude);
                
                // Check if boat is back (from gps data)
                if(!checkDistanceWithBaseLocation(boatName)) 
                    dbRoute.endRoute(boatName, timeResult);
            }
            // Boat hasnt left yet (check if boat is leaving)
            else if(boatLeft == 0 && checkDistanceWithBaseLocation(boatName)) 
                dbRoute.boatLeftFlag(boatName, timeResult);

            httpUtil.endResponse(response, httpUtil.CREATED);
        });

    }
    // Catch the errors when it failed
    catch(error) {
        console.log(error);
        httpUtil.endResponse(response, httpUtil.INTERNAL_ERROR);
    }
}

// Get info from the maps API about the distance from the calibrated base (true is away, false is at base)
function checkDistanceWithBaseLocation(boatName) {
    var distance = 2;
    if(distance > 0.2){
        return true;
    }
    else {
        return false;
    }
}

module.exports.recieveGpsLocation = recieveGpsLocation;
module.exports.getAllRouteInfo = getAllRouteInfo;
module.exports.getAllBoatInfo = getAllBoatInfo;
module.exports.calibrateLocation = calibrateBaseLocation;