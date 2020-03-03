const dbCore = require("./Database-Essentials");
const timestamp = require("./Utils/Timestamp");

// Queries
const createNewRoute = "INSERT INTO route (begin_time, boat_boat_name, end_time) VALUES (";
const updateEndRoute = "UPDATE route SET returned = 1 WHERE ";

// Function for adding a boat that will be in use soon
function addRouteForBoat(boatName, startTime, endTime) {
    var completeQuery = createNewRoute + 
    "'" + timestamp.createTimestampSQLInput(startTime) + "'" +
    ", '" + boatName + "'" +
    ", '" + timestamp.createTimestampSQLInput(endTime) + "'" +
    ");";

    dbCore.doQuery(completeQuery);
}

// Check if the route requested is already finished
function hasRouteStarted(boatName, startTime) {

}

endRoute("viermineen", "00:00");


// End the route by setting the returned flag to 1
function endRoute(boatName, startTime) {
    var completeQuery = updateEndRoute + 
    "begin_time = '" + timestamp.createTimestampSQLInput(startTime) + "'" +
    ", boat_boat_name = '" + boatName + "'" +
    ");";
    console.log(completeQuery);

    //dbCore.doQuery(completeQuery);
}

// Get info from the maps API about the length of the route
function checkDistanceWithBaseLocation(boatName) {

}