const dbCore = require("./Database-Essentials");
const timestamp = require("./Utils/Timestamp");
const httpUtil = require("./Utils/Http");
const EventEmitter = require('events');
const lastRouteReturned = new EventEmitter();
const routeCheck = new EventEmitter();

// Queries
const createNewRoute = "INSERT INTO route (begin_time, boat_name, end_time) VALUES (";
const updateReturnFlag = "UPDATE route SET returned = 1 WHERE ";
const updateLeftFlag = "UPDATE route SET `left` = 1 WHERE ";
const getRouteFlags = "SELECT returned, `left` FROM route WHERE ";

const getLastKnownRoute = "SELECT begin_time FROM route WHERE returned = 0 AND boat_name = "

// Function for adding a boat that will be in use soon
function addRouteForBoat(boatTimeObject, response) {
    var completeQuery = createNewRoute + 
    "'" + timestamp.createTimestampSQLInput(boatTimeObject.begin_time) + "'" +
    ", '" + boatTimeObject.boat_name + "'" +
    ", '" + timestamp.createTimestampSQLInput(boatTimeObject.end_time) + "'" +
    ");";

    dbCore.doQuery(completeQuery, (results) => {
        httpUtil.endResponse(response, results ? httpUtil.CREATED : httpUtil.BAD_REQUEST);
    });
}

// Check if the route requested has already finished
function hasRouteStarted(boatName) {
    getLastRoute(boatName);

    lastRouteReturned.on("recieved", (timeResult) => {
        var hourMinuteTime = timeResult.getHours() + ":" + timeResult.getMinutes();
        var completeQuery = getRouteFlags + 
        "begin_time = \"" + timestamp.createTimestampSQLInput(hourMinuteTime) + "\" " + 
        "AND boat_name = \"" + boatName + 
        "\";";

        dbCore.doQuery(completeQuery, (result) => {
            routeCheck.emit("done", result, hourMinuteTime);
        });
    });
}

// End the route by setting the returned flag to 1
function endRoute(boatName, startTime) {
    var completeQuery = updateReturnFlag + 
    "begin_time = \"" + timestamp.createTimestampSQLInput(startTime) + "\"" +
    "AND boat_name = \"" + boatName + "\"" +
    ";";

    dbCore.doQuery(completeQuery);
}

// Set the "left" flag for the boat which will start the route tracking
function boatLeftFlag(boatName, startTime) {
    var completeQuery = updateLeftFlag + 
    "begin_time = \"" + timestamp.createTimestampSQLInput(startTime) + "\"" +
    " AND boat_name = \"" + boatName + "\"" +
    ";";

    dbCore.doQuery(completeQuery);
}

// Get the last known route and check if this route has started
function getLastRoute(boatName) {
    var completeQuery = getLastKnownRoute + "\"" +
    boatName + "\" AND " + 
    "begin_time < '" + timestamp.createTimestampSQL() + "'" +
    "ORDER BY begin_time DESC;";

    dbCore.doQuery(completeQuery, (result) => { 
        console.log(result);
        lastRouteReturned.emit("recieved", result ? result[0].begin_time : null)
    });
}

module.exports.boatLeftFlag = boatLeftFlag;
module.exports.endRoute = endRoute;

module.exports.hasRouteStarted = hasRouteStarted;
module.exports.addRouteForBoat = addRouteForBoat;

module.exports.routeCheck = routeCheck;