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
const getBaseLocation = "SELECT `base_latitude`, `base_longitude` FROM boat WHERE `boat_name` = '";

// Function for storing a new calibrated location for the specified boat
function calibrateBaseLocation(newLocation, boatName, response) {
    var connection = createDatabaseConnection();

    // Error out when connection failed
    if(!connection) { console.log("connection failed to database"); return; }

    var completeQuery = updateBaseLocation + 
    "`base_latitude` = '" + newLocation.latitude + 
    "', `base_longitude` = '" + newLocation.longitude +
    "' WHERE `boat_name` = '" + boatName + "';"; 

    // Query to the database
    connection.query(completeQuery, (error, result, fields) => {
        // Show the result
        console.log(error ? error : result);
        connection.end(); 

        // End the http request
        response.end(error ? "Error" : "Location calibrated");
    });
} 

// Function to get the last known location of the specified boat 
function getLastKnownLocation(boatName, callback) {
    var connection = createDatabaseConnection();
    
    // Error out when connection failed
    if(!connection) { console.log("connection failed to database"); return; }

    var completeQuery = getBaseLocation + boatName + "';"; 

    // Query to the database
    connection.query(completeQuery, (error, result, fields) => {
        // Show the result
        console.log(error ? error : result);
        connection.end(); 

        if(!error)
            callback({ latitude: result[0].base_latitude, longitude: result[0].base_longitude });
    });
}


// Create and return the connection with the database
function createDatabaseConnection() {
    var connection = mysql.createConnection(connectionVariables);

    connection.connect(error => { if(error) console.log(error) });

    return connection;
}

module.exports.calibrateLocation = calibrateBaseLocation;
module.exports.getLastKnownLocation = getLastKnownLocation;