// Script to maintain all the incoming location data from the GPS

const dbCore = require("./Database-Essentials");
const timestamp = require("./Utils/Timestamp");

// Queries
const updateBaseLocation = "UPDATE boat SET ";
const getBaseLocation = "SELECT base_latitude, base_longitude FROM boat WHERE boat_name = '";
const getBoatInfo = "SELECT boat_name FROM boat";
const addNewLocation = "INSERT INTO geolocation (time, route_begin_time, route_boat_boat_name, latitude, longitude) VALUES (";

// Function for storing a new calibrated location for the specified boat
function calibrateBaseLocation(newLocation, boatName, response) {
    var completeQuery = updateBaseLocation + 
    "base_latitude = '" + newLocation.latitude + 
    "', base_longitude = '" + newLocation.longitude +
    "' WHERE boat_name = '" + boatName + "';"; 

    // Query to the database
    dbCore.doQuery(completeQuery, (result) => 
        // End the http request
        response.end(result ? "succeeded" : "error")
    );
}

// Function to get the last known location of the specified boat 
function getLastKnownLocation(boatName, callback) {
    var completeQuery = getBaseLocation + boatName + "';"; 

    // Query to the database
    dbCore.doQuery(completeQuery, (result) =>
        // Return a location object
        callback({ latitude: result[0].base_latitude, longitude: result[0].base_longitude })
    );
}

// Add a new location object to a route (from gps)
function addLocationObject(boatName, beginTime, latitude, longitude) {
    var completeQuery = addNewLocation +
    " '" + timestamp.createTimestampSQL() + "'" +
    ", '" + timestamp.createTimestampSQLInput(beginTime) + "'" +
    ", '" + boatName + "'" +
    ", " + latitude + 
    ", " + longitude +
    ");"; 

    // Query to the database
    dbCore.doQuery(completeQuery);
}

function getAllRouteInfo() {

}

function getAllBoatInfo(response) {
    dbCore.doQuery(getBoatInfo, (result) =>
        response.end(JSON.stringify(result))
    );
}

module.exports.getAllRouteInfo = getAllRouteInfo;
module.exports.getAllBoatInfo = getAllBoatInfo;
module.exports.calibrateLocation = calibrateBaseLocation;
module.exports.getLastKnownLocation = getLastKnownLocation;