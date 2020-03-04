const dbCore = require("./Database-Essentials");
const timestamp = require("./Utils/Timestamp");

// Queries
const createNewRoute = "INSERT INTO route (begin_time, boat_name, end_time) VALUES (";
const updateEndRoute = "UPDATE route SET returned = 1 WHERE ";
const getReturnedFlag = "SELECT returned FROM route WHERE ";
const getLastKnownRoute = "SELECT begin_time FROM route WHERE returned = 0 left = 1 boat_name = "

// Function for adding a boat that will be in use soon
function addRouteForBoat(boatTimeObject) {
    var completeQuery = createNewRoute + 
    "'" + timestamp.createTimestampSQLInput(boatTimeObject.begin_time) + "'" +
    ", '" + boatTimeObject.boat_name + "'" +
    ", '" + timestamp.createTimestampSQLInput(boatTimeObject.end_time) + "'" +
    ");";

    dbCore.doQuery(completeQuery);
}

// Check if the route requested has already finished
function hasRouteStarted(boatName, startTime) {
    var completeQuery = getReturnedFlag + 
    "begin_time = '" + startTime + "', " + 
    "boat_name = '" + boatName + 
    "');";

    dbCore.doQuery(completeQuery, (result) => {
        console.log("print");
    });
}

// End the route by setting the returned flag to 1
function endRoute(boatName, startTime) {
    var completeQuery = updateEndRoute + 
    "begin_time = '" + timestamp.createTimestampSQLInput(startTime) + "'" +
    ", boat_name = '" + boatName + "'" +
    ");";

    dbCore.doQuery(completeQuery);
}

// Get the last known route and check if this route has started
function getLastRoute(boatName) {
    var completeQuery = getLastKnownRoute + "\"" +
    boatName + "\" " + 
    "ORDER BY begin_time;";

    dbCore.doQuery(completeQuery, (result) => { 
        console.log(result);
    });
}

function updateLatestRoute(boatName, gpsObject) {

}

// Get info from the maps API about the length of the route
function checkDistanceWithBaseLocation(boatName) {

}

module.exports.addRouteForBoat = addRouteForBoat;