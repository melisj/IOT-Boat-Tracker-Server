// Script to maintain all the incoming location data from the GPS

const dbCore = require("./Database-Essentials");
const timestamp = require("../Utils/Timestamp");
const fileManager = require("../File-Manager");
const dbRoute = require("./Route-Database");
const httpUtil = require("../Utils/Http");
const mathUtil = require("../Utils/MathUtil");

// Queries
const updateBoatLocation = "UPDATE boat SET ";
const addNewLocationToRoute = "INSERT INTO geolocation (time, route_begin_time, route_boat_name, latitude, longitude) VALUES (";
const getDistanceBaseCurrent = "SELECT base_latitude, base_longitude, cur_latitude, cur_longitude FROM boat WHERE `name` = \""
const getAllLocationsFromRoute = "SELECT latitude, longitude FROM geolocation WHERE route_boat_name = \""

// Distance from base location before the left/returned flag will be set (meters)
const thresholdDistance = 50;

// Function for storing a new calibrated location for the specified boat
function calibrateBaseLocation(boatInfo, response) {
    var newLocation = fileManager.loadLocationCache(boatInfo.boat_name);

    // Complete the query
    var completeQuery = updateBoatLocation + 
    "base_latitude = '" + newLocation.latitude + 
    "', base_longitude = '" + newLocation.longitude +
    "' WHERE name = '" + boatInfo.boat_name + "';"; 

    // Query to the database
    dbCore.doQuery(completeQuery, (result) => {
        // End the http request
        httpUtil.endResponse(response, 
            result ? httpUtil.CREATED : httpUtil.INTERNAL_ERROR, 
            result ? "succeeded" : "error"); // Respond
    });
}

// Update the current location for a specific boat
function updateCurrentLocation (gpsObject) {
    // Store the position in the cache
    fileManager.saveLocationCache(gpsObject);

    // Store the position in the database
    var completeQuery = updateBoatLocation + 
    "cur_latitude = '" + gpsObject.latitude + 
    "', cur_longitude = '" + gpsObject.longitude +
    "' WHERE name = '" + gpsObject.boat_name + "';"; 

    dbCore.doQuery(completeQuery);
} 

// Add a new location object to a route (from gps)
function addLocationObject(boatName, beginTime, latitude, longitude) {
    var completeQuery = addNewLocationToRoute +
    " '" + timestamp.createTimestampSQL() + "'" +
    ", '" + timestamp.createTimestampSQLGivenTime(beginTime) + "'" +
    ", '" + boatName + "'" +
    ", " + latitude + 
    ", " + longitude +
    ");"; 

    // Query to the database
    dbCore.doQuery(completeQuery);
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
    var completeQuery = getDistanceBaseCurrent + boatName + "\";";

    dbCore.doQuery(completeQuery, (result, error) => {
        var isBeyondDistance = mathUtil.calculateStraightLineDistance(result[0]) > thresholdDistance;
        callback(isBeyondDistance, error);
    });
}

// Get a specific route from the database
function getCompleteRoute(response, boatName, begin_time) {
    var completeQuery = getAllLocationsFromRoute + boatName + "\"" + 
    " AND route_begin_time = \"" + timestamp.createTimestampSQLTimeCurrentDay(begin_time) + "\";";

    dbCore.doQuery(completeQuery, (result, error) => {
        httpUtil.endResponse(response, error ? httpUtil.INTERNAL_ERROR : httpUtil.OK, JSON.stringify(result));
    });
}

module.exports.getCompleteRoute = getCompleteRoute;
module.exports.checkDistanceWithBaseLocation = checkDistanceWithBaseLocation;
module.exports.recieveGpsLocation = recieveGpsLocation;
module.exports.calibrateLocation = calibrateBaseLocation;