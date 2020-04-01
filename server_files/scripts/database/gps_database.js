// Script to maintain all the incoming location data from the GPS

const dbCore = require("./database_essentials");
const timestamp = require("../utils/timestamp");
const fileManager = require("../file_manager");
const dbRoute = require("./route_database");
const httpUtil = require("../utils/http_util");
const mathUtil = require("../utils/math_util");

// Queries
const updateBoatCurrentLocation = "UPDATE boat SET cur_latitude = ? AND cur_longitude = ? WHERE `name` = ?;";
const updateBoatBaseLocation = "UPDATE boat SET base_latitude = ? AND base_longitude = ? WHERE `name` = ?;";
const addNewLocationToRoute = "INSERT INTO geolocation (time, route_begin_time, route_boat_name, latitude, longitude) VALUES (?,?,?,?,?);";
const getBaseCurrentLocations = "SELECT base_latitude, base_longitude, cur_latitude, cur_longitude FROM boat WHERE name = ?;"
const getAllLocationsFromRoute = "SELECT latitude, longitude FROM geolocation WHERE route_boat_name = ? AND route_begin_time = ?;"

// Distance from base location before the left/returned flag will be set (meters)
const thresholdDistance = 50;

// Function for storing a new calibrated location for the specified boat
function calibrateBaseLocation(boatInfo, response) {
    var newLocation = fileManager.loadLocationCache(boatInfo.boat_name);

    // Get the necessary variables 
    var queryVariables = [newLocation.latitude, newLocation.longitude, boatInfo.boat_name];

    // Query to the database
    dbCore.doQuery(updateBoatBaseLocation, queryVariables, (result) => {
        // End the http request
        httpUtil.endResponse(response, 
            result ? httpUtil.CREATED : httpUtil.INTERNAL_ERROR, 
            result ? "succeeded" : "error");
    });
}

// Update the current location for a specific boat
function updateCurrentLocation (gpsObject) {
    // Store the position in the cache
    fileManager.saveLocationCache(gpsObject);

    // Get the necessary variables 
    var queryVariables = [gpsObject.latitude, gpsObject.longitude, gpsObject.boat_name];

    dbCore.doQuery(updateBoatCurrentLocation, queryVariables);
} 

// Add a new location object to a route (from gps)
function addLocationObject(boatName, beginTime, latitude, longitude) {
    var queryVariables = [timestamp.createTimestampSQL(), 
        timestamp.createTimestampSQLGivenTime(beginTime),
        boatName,
        latitude,
        longitude];

    // Query to the database
    dbCore.doQuery(addNewLocationToRoute, queryVariables);
}

// Recieve an gps location from a boat and store it appropriately
function recieveGpsLocation(gpsObject, response) {
    try {
        // Store it in the database in the cur position of the boat
        updateCurrentLocation(gpsObject);

        // Make a call for checking if the boat has already been returned or has left the base
        dbRoute.hasRouteStarted(gpsObject.boat_name);

        // Check what route reservation is active right now
        dbRoute.routeInfo.on("done", (result, timeResult) => {
            // End the connection when it failed
            if(result == null || timeResult == null) {
                httpUtil.endResponse(response, httpUtil.NO_CONTENT); // Respond
                return;
            }

            console.log("an gps location has been send");

            var boatLeft = result[0].left;
            var boatReturned = result[0].returned;

            // Check if the boat is gone (from database)
            if(boatReturned == 0 && boatLeft == 1) {
                addLocationObject(gpsObject.boat_name, timeResult, gpsObject.latitude, gpsObject.longitude);
                
                // Check if boat is back (from gps data)
                checkDistanceWithBaseLocation(gpsObject.boat_name, (isOutsideBase) => {
                    // Set returned flag
                    if(!isOutsideBase)
                        dbRoute.setRouteFlag(gpsObject.boat_name, timeResult, true);
                });
            }
            // Boat hasnt left yet (check if boat is leaving)
            else if(boatLeft == 0) {
                checkDistanceWithBaseLocation(gpsObject.boat_name, (isOutsideBase) => {
                    // Set left flag and add an location object
                    if(isOutsideBase) {
                        addLocationObject(gpsObject.boat_name, timeResult, gpsObject.latitude, gpsObject.longitude);
                        dbRoute.setRouteFlag(gpsObject.boat_name, timeResult, false);
                    }
                });
            }

            httpUtil.endResponse(response, httpUtil.CREATED); // Respond
            dbRoute.routeInfo.removeAllListeners("done");
        });
    }
    // Catch the errors when it failed
    catch(error) {
        console.log(error);
        httpUtil.endResponse(response, httpUtil.INTERNAL_ERROR); // Respond
    }
}

// Get info from the maps API about the distance from the calibrated base (true is away, false is at base)
function checkDistanceWithBaseLocation(boatName, callback) {
    dbCore.doQuery(getBaseCurrentLocations, [boatName], (result, error) => {
        var isBeyondDistance = mathUtil.calculateStraightLineDistance(result[0]) > thresholdDistance;
        callback(isBeyondDistance, error);
    });
}

// Get a specific route from the database
function getCompleteRoute(response, boatName, begin_time) {
    var queryVariables = [boatName, timestamp.createTimestampSQLTimeCurrentDay(begin_time)];

    dbCore.doQuery(getAllLocationsFromRoute, queryVariables, (result, error) => {
        httpUtil.endResponse(response, error ? httpUtil.INTERNAL_ERROR : httpUtil.OK, JSON.stringify(result));
    });
}

module.exports.getCompleteRoute = getCompleteRoute;
module.exports.checkDistanceWithBaseLocation = checkDistanceWithBaseLocation;
module.exports.recieveGpsLocation = recieveGpsLocation;
module.exports.calibrateLocation = calibrateBaseLocation;