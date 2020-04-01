// Script helping with handeling requests for storing and retrieving route/reservation info

const dbCore = require("./database_essentials");
const timestamp = require("../utils/timestamp");
const httpUtil = require("../utils/http_util");
const EventEmitter = require('events');

// You can subscribe to this event when you want to call for information about the status of the boat
const routeInfo = new EventEmitter();

// Queries
const createNewRoute = "INSERT INTO route (begin_time, boat_name, end_time) VALUES (?,?,?);";
const updateReturnFlag = "UPDATE route SET returned = 1 WHERE begin_time = ? AND boat_name = ?";
const updateLeftFlag = "UPDATE route SET `left` = 1 WHERE begin_time = ? AND boat_name = ?";
const getRouteFlags = "SELECT returned, `left` FROM route WHERE begin_time = ? AND boat_name = ?";

const getLastKnownRoute = "SELECT begin_time FROM route WHERE returned = 0 AND boat_name = ? AND begin_time = ? ORDER BY begin_time DESC;"
const getAllDailyRoutes = "SELECT boat_name, begin_time, end_time FROM route WHERE begin_time > ?;"

const getBoatInfo = "SELECT `name` FROM boat";

// Function for adding a boat that will be in use soon
function addRouteForBoat(boatTimeObject, response) {
    var queryVariables = [timestamp.createTimestampSQLTimeCurrentDay(boatTimeObject.begin_time), 
        boatTimeObject.boat_name, 
        timestamp.createTimestampSQLTimeCurrentDay(boatTimeObject.end_time) ];

    console.log(timestamp.createTimestampSQLTimeCurrentDay(boatTimeObject.begin_time));

    dbCore.doQuery(createNewRoute, queryVariables, (results, error) => {
        httpUtil.endResponse(response, error != null ? httpUtil.BAD_REQUEST : httpUtil.CREATED);
    });
}

// Check if the route requested has already finished
function hasRouteStarted(boatName) {
    routeInfo.on("lastRoute", (timeResult) => {
        // Error out when nothing was found
        if(timeResult == null) {
            routeInfo.emit("done", null, null);
            return;
        }

        var queryVariables = [timestamp.createTimestampSQLGivenTime(timeResult), boatName];

        dbCore.doQuery(getRouteFlags, queryVariables, (flagsResult) => {
            routeInfo.emit("done", flagsResult, timeResult);
        });
        routeInfo.removeAllListeners("lastRoute");
    });

    // Get last route will emit an event for lastRoute
    getLastRoute(boatName);
}

// End the route by setting the returned flag to 1
function setRouteFlag(boatName, startTime, returned) {

    var queryVariables = [timestamp.createTimestampSQLGivenTime(startTime), boatName];

    dbCore.doQuery((returned ? updateReturnFlag : updateLeftFlag), queryVariables);
}

// Get the last known route and check if this route has started
function getLastRoute(boatName) {
    var queryVariables = [boatName, timestamp.createTimestampSQL()];

    // Get the first result of the list
    dbCore.doQuery(getLastKnownRoute, queryVariables, (result) => { 
        routeInfo.emit("lastRoute", result.length != 0 ? result[0].begin_time : null)
    });
}

// Get all the routes for the current day 
function getDailyRoutes(response) {
    var queryVariables = [timestamp.createTimestampSQLTimeCurrentDay("00:00")];

    // Get the first result of the list
    dbCore.doQuery(getAllDailyRoutes, queryVariables, (result, error) => { 
        // Convert time to a hour and minute timestamp
        result.forEach((value, index) => { 
            result[index].begin_time = value.begin_time.getHours() + ":" + ((value.begin_time.getMinutes() == 0) ? "00" : "30");
            result[index].end_time = value.end_time.getHours() + ":" + ((value.end_time.getMinutes() == 0) ? "00" : "30");
        });
        httpUtil.endResponse(response, error ? httpUtil.INTERNAL_ERROR : httpUtil.OK, JSON.stringify(result));
    });
}

// Retrieve all the boats in the database
function getBoatNames(response) {
    dbCore.doQuery(getBoatInfo, [""], (result) => {
        httpUtil.endResponse(response, result ? httpUtil.OK : httpUtil.INTERNAL_ERROR, JSON.stringify(result)); // Respond
    }); 
}

module.exports.setRouteFlag = setRouteFlag;

module.exports.getDailyRoutes = getDailyRoutes;
module.exports.hasRouteStarted = hasRouteStarted;
module.exports.addRouteForBoat = addRouteForBoat;
module.exports.getBoatNames = getBoatNames;

module.exports.routeInfo = routeInfo;