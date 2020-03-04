// Server file, this script will handle all the incoming requests

const http = require("http");
const queryParser = require("querystring");
const weather = require("./Javascript/Server-Side/API's/Weather-API");
const gps_data = require("./Javascript/Server-Side/GPS-Database");
const route_data = require("./Javascript/Server-Side/Route-Database");
const fileManager = require("./Javascript/Server-Side/File-Manager");

const HARDCODE_BOAT = "viermineen";

// Create a server
const server = http.createServer((request, response) => {
    console.log(request.url);
    console.log(request.connection.remoteAddress);
   
    // Catch errors
    request.on("error", (error) => console.log(error));

    // Check if this request has access to the requested files
    if(isRequestRestricted(request.url)) {
        console.log("404 error, files could not be found");
        response.end("404 error, files could not be found");
    }
    else {
        // Respond to POST requests
        if(request.method == "POST")
            handlePostRequest(request, response);
        // Respond to GET requests
        else
            handleGetRequest(request, response);
    }
});
server.listen(80);


// Check if the url the client wants to access are not restricted
function isRequestRestricted(requestString) {
    requestString = requestString.toLowerCase();

    // Keep requests for anything that has to do with the server out of the requests
    if(requestString.includes("server")){
        return true;
    }

    return false;
}

// Request weather info and send this info back into a string
function recieveWeatherData(responsObj) {
    weather.requestWeather(HARDCODE_BOAT);

    weather.on("recieved", (data) => {
        responsObj.end(JSON.stringify(data));
    });
}

// Handle all the possible POST requests
function handlePostRequest(request, response){
    var data = "";
    
    // Collect all the data
    request.on("data", (dataChunk) => data += dataChunk);

    // Parse the data to an object and use the object depending on the request
    request.on("end", () => {
        var postObject = queryParser.parse(data);
        console.log(postObject);
        // TODO clean input
        

        switch(request.url) {
            // Request from client to create a new route
            case "/client/sendroute": route_data.addRouteForBoat(postObject); response.end();
            break;
            // Save the gps location
            case "/gps": fileManager.saveLocationCache(HARDCODE_BOAT, postObject); response.end();
            break;
        }
    })
}

// Handle all the possible GET requests
function handleGetRequest(request, response){ 
    switch(request.url)
    {
        // Do a homepage request
        case "/" : response.end(fileManager.loadFile("HTML/GPS.html"));
        break;
        // Do a arduino request for the weather (close response when data is collected)
        case "/arduino/weather": recieveWeatherData(response);
        return;
        // Do a arduino request for the calibration
        case "/arduino/calibrate": gps_data.calibrateLocation(fileManager.loadLocationCache(HARDCODE_BOAT), HARDCODE_BOAT, response);
        break;
        // Do a request for all the boat info there is
        case "/client/boatinfo": gps_data.getAllBoatInfo(response);
        break;
        // Do a request for specific resources
        default : response.end(fileManager.loadFile(request.url.substring(1)));
    }
}