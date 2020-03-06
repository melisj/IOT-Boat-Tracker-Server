const dbCore = require("./Database-Essentials");
const timestamp = require("./Utils/Timestamp");
const httpUtil = require("./Utils/Http");
const EventEmitter = require('events');
const routeInfo = new EventEmitter();

// Queries
const createNewRoute = "INSERT INTO route (begin_time, boat_name, end_time) VALUES (";
const updateReturnFlag = "UPDATE route SET returned = 1 WHERE ";
const updateLeftFlag = "UPDATE route SET `left` = 1 WHERE ";
const getRouteFlags = "SELECT returned, `left` FROM route WHERE ";

const getLastKnownRoute = "SELECT begin_time FROM route WHERE returned = 0 AND boat_name = "

// Function for adding a boat that will be in use soon
function addRouteForBoat(boatTimeObject, response) {
    var completeQuery = createNewRoute + 
    "'" + timestamp.createTimestampSQLTimeCurrentDay(boatTimeObject.begin_time) + "'" +
    ", '" + boatTimeObject.boat_name + "'" +
    ", '" + timestamp.createTimestampSQLTimeCurrentDay(boatTimeObject.end_time) + "'" +
    ");";

    console.log(timestamp.createTimestampSQLTimeCurrentDay(boatTimeObject.begin_time));

    dbCore.doQuery(completeQuery, (results) => {
        httpUtil.endResponse(response, results ? httpUtil.CREATED : httpUtil.BAD_REQUEST);
    });
}

// Check if the route requested has already finished
function hasRouteStarted(boatName) {
    getLastRoute(boatName);

    routeInfo.on("lastRoute", (timeResult) => {
        // Error out when nothing was found
        if(timeResult == null) {
            routeInfo.emit("done", null, null);
            return;
        }

        var completeQuery = getRouteFlags + 
        "begin_time = \"" + timestamp.createTimestampSQLGivenTime(timeResult) + "\" " + 
        "AND boat_name = \"" + boatName + 
        "\";";

        dbCore.doQuery(completeQuery, (result) => {
            routeInfo.emit("done", result, timeResult);
        });
        routeInfo.removeAllListeners("lastRoute");
    });
}

// End the route by setting the returned flag to 1
function setRouteFlag(boatName, startTime, returned) {
    var completeQuery = (returned ? updateReturnFlag : updateLeftFlag) + 
    "begin_time = \"" + timestamp.createTimestampSQLGivenTime(startTime) + "\"" +
    "AND boat_name = \"" + boatName + "\"" +
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
        routeInfo.emit("lastRoute", result.length != 0 ? result[0].begin_time : null)
    });
}

module.exports.setRouteFlag = setRouteFlag;

module.exports.hasRouteStarted = hasRouteStarted;
module.exports.addRouteForBoat = addRouteForBoat;

module.exports.routeInfo = routeInfo;