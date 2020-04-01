// Script maintaining the database connection and doing queries.

const mysql = require("mysql");

// Variables for the mysql database
const connectionVariables = {
    host: "localhost",
    user: "root",
    password: "root",
    database: "boattracker"
};

// Create and return the connection with the database
function createDatabaseConnection() {
    var connection = mysql.createConnection(connectionVariables);

    connection.connect(error => { if(error) console.log(error); });

    // Error out when connection failed
    if(!connection) console.log("connection failed to database");

    return connection;
}

// Query something
function queryToDatabase(query, variables, callback) {
    var connection = createDatabaseConnection();

    if(connection) {    
        // Do the query
        connection.query(query, variables, (error, result) => {
            if(error) console.log(error);

            // Send out the callback with the results and connection when keepConnection is true
            if(callback)
                callback(result, error);

            // End the connection
            connection.end();
        });
    }
}

module.exports.doQuery = queryToDatabase;
module.exports.createDatabaseConnection = createDatabaseConnection;