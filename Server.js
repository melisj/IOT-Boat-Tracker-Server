// Server file, this script will handle all the incoming requests

const http = require("http");
const queryParser = require("querystring");
const weather = require("./server_files/scripts/api's/weather_api");
const dbGps = require("./server_files/scripts/database/gps_database");
const dbRoute = require("./server_files/scripts/database/route_database");
const fileManager = require("./server_files/scripts/file_manager");
const httpUtil = require("./server_files/scripts/utils/http_util");

// Homepage is the gps site
const homepage = "client_files/html/gps.html";

// Create a server
const server = http.createServer((request, response) => {
    console.log(request.url);
    console.log(request.connection.remoteAddress);
   
    // Catch errors
    request.on("error", (error) => console.log(error));

    // Check if this request has access to the requested files
    if(isRequestRestricted(request.url)) {
        console.log("Forbiden request");
        response.statusCode = statusCodes.FORBIDEN;
        response.end();
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

// Handle all the possible POST requests
function handlePostRequest(request, response){
    var data = "";
    
    // Collect all the data
    request.on("data", (dataChunk) => data += dataChunk);

    // Parse the data to an object and use the object depending on the request
    request.on("end", () => {
        var postObject = queryParser.parse(data);
        console.log(postObject);

        switch(request.url) {
            // Request from client to create a new route
            case "/client/sendroute": dbRoute.addRouteForBoat(postObject, response);
            break;
            // Save the gps location
            case "/gps": dbGps.recieveGpsLocation(postObject, response);
            break;
            // Do a arduino request for the calibration
            case "/arduino/calibrate": dbGps.calibrateLocation(postObject, response);
            break;
        }

        request.removeAllListeners();
    })
}

// Handle all the possible GET requests
function handleGetRequest(request, response){ 
    var dataAfterIndex = request.url.indexOf("?");
    var cutDownUrl = request.url; 
    var getObject = null;

    // Get the data send with the url
    if(dataAfterIndex != -1) {
        var getObject = queryParser.parse(cutDownUrl.substring(dataAfterIndex + 1));
        cutDownUrl = cutDownUrl.substring(0, dataAfterIndex);
    }

    switch(cutDownUrl)
    {
        // Do a homepage request
        case "/" : fileManager.loadFile(homepage, response);
        break;
        // Do a arduino request for the weather (close response when data is collected)
        case "/arduino/weather": recieveWeatherData(response, getObject);
        return;
        // Do a request for all the boat names
        case "/client/boats": dbRoute.getBoatNames(response);
        break;
        // Do a request for location information about one boat
        case "/client/boatlocation": loadCacheAndRespond(response, getObject);
        break;
        // Do a request for the status of the boat (by checking distance)
        case "/client/boatstatus": getDistanceBetweenBoatAndBase(response, getObject)
        break;
        // Do a request for all the routes that have been done today
        case "/client/boatroutes": dbRoute.getDailyRoutes(response);
        break;
        // Do a request for all locations of a route
        case "/client/completeroute": getAllLocationsOfRoute(response, getObject);
        break;
        // Do a request for specific resources
        default : fileManager.loadFile(request.url.substring(1), response);
    }
}

// Request weather info and send this info back into a string
function recieveWeatherData(response, getObject) {
    if(getObject){
        weather.on("recieved", (data, httpReturnStatus) => {
            httpUtil.endResponse(response, httpReturnStatus, JSON.stringify(data));
            weather.removeAllListeners("recieved");
        });

        weather.requestWeather(getObject.boat_name);
    }
    else 
        httpUtil.endResponse(response, httpUtil.BAD_REQUEST);
}

// Call the function to get the distance between the boat and the calibrated base
function getDistanceBetweenBoatAndBase(response, getObject) {
    try{
        dbGps.checkDistanceWithBaseLocation(getObject.boat_name, (result, error) => {
            httpUtil.endResponse(response, error ? httpUtil.NO_CONTENT : httpUtil.OK, JSON.stringify(result));
        });
    }
    catch(error) { 
        httpUtil.endResponse(response, httpUtil.BAD_REQUEST);
    }
}

// Load the cache and respond to the client 
function loadCacheAndRespond(response, getObject)  {
    try {
        fileManager.loadLocationCache(getObject.boat_name, response);
    }
    catch(error) {
        httpUtil.endResponse(response, httpUtil.BAD_REQUEST);
    }
}

// Get all the locations of one route
function getAllLocationsOfRoute(response, getObject) {
    try {
        dbGps.getCompleteRoute(response, getObject.boat_name, getObject.begin_time);
    }
    catch(error) {
        httpUtil.endResponse(response, httpUtil.BAD_REQUEST);
    }
}