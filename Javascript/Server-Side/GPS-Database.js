const mysql = require("mysql");

// Variables for the mysql database
const connectionVariables = {
    host: "localhost",
    user: "root",
    password: "root",
    database: "boattracker"
};

// Queries
const updateBaseLocation = "UPDATE boat SET ";
const getBaseLocation = "SELECT base_latitude, base_longitude FROM boat WHERE boat_name = '";
const getBoatInfo = "SELECT boat_name FROM boat";

// Function for storing a new calibrated location for the specified boat
function calibrateBaseLocation(newLocation, boatName, response) {
    var connection = createDatabaseConnection();

    if(connection) {    
        var completeQuery = updateBaseLocation + 
        "base_latitude = '" + newLocation.latitude + 
        "', base_longitude = '" + newLocation.longitude +
        "' WHERE boat_name = '" + boatName + "';"; 

        // Query to the database
        connection.query(completeQuery, (error, result) => {
            if (error) console.log(error);
            connection.end(); 

            // End the http request
            response.end(error ? "Error" : "Location calibrated");
        });
    } 
}

// Function to get the last known location of the specified boat 
function getLastKnownLocation(boatName, callback) {
    var connection = createDatabaseConnection();

    if (connection) {
        var completeQuery = getBaseLocation + boatName + "';"; 

        // Query to the database
        connection.query(completeQuery, (error, result) => {
            connection.end(); 

            if(!error)
                callback({ latitude: result[0].base_latitude, longitude: result[0].base_longitude });
            else 
                console.log(error);
        });
    }
}


// Create and return the connection with the database
function createDatabaseConnection() {
    var connection = mysql.createConnection(connectionVariables);

    connection.connect(error => { if(error) console.log(error) });

    // Error out when connection failed
    if(!connection) console.log("connection failed to database");

    return connection;
}



function getAllRouteInfo() {

}

function getAllBoatInfo(response) {
    var connection = createDatabaseConnection();

    if (connection) {
        connection.query(getBoatInfo, (error, result) => {
            if(error) console.log(error);

            response.end(JSON.stringify(result));
        });
    }
}

module.exports.getAllRouteInfo = getAllRouteInfo;
module.exports.getAllBoatInfo = getAllBoatInfo;
module.exports.calibrateLocation = calibrateBaseLocation;
module.exports.getLastKnownLocation = getLastKnownLocation;