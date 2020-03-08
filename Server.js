// Server file, this script will handle all the incoming requests

const http = require("http");
const queryParser = require("querystring");
const weather = require("./Javascript/Server-Side/API's/Weather-API");
const dbGps = require("./Javascript/Server-Side/GPS-Database");
const dbRoute = require("./Javascript/Server-Side/Route-Database");
const fileManager = require("./Javascript/Server-Side/File-Manager");
const httpUtil = require("./Javascript/Server-Side/Utils/Http");

const HARDCODE_BOAT = "viermineen";

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

// Request weather info and send this info back into a string
function recieveWeatherData(response) {
    weather.requestWeather(HARDCODE_BOAT);

    weather.on("recieved", (data, httpReturnStatus) => {
        httpUtil.endResponse(response, httpReturnStatus, JSON.stringify(data));
        weather.removeAllListeners("recieved");
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
            case "/client/sendroute": dbRoute.addRouteForBoat(postObject, response);
            break;
            // Save the gps location
            case "/gps": dbGps.recieveGpsLocation(postObject, response);
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

    if(dataAfterIndex != -1) {
        var getObject = queryParser.parse(cutDownUrl.substring(dataAfterIndex + 1));
        cutDownUrl = cutDownUrl.substring(0, dataAfterIndex);
    }

    switch(cutDownUrl)
    {
        // Do a homepage request
        case "/" : fileManager.loadFile("HTML/gps.html", response);
        break;
        // Do a arduino request for the weather (close response when data is collected)
        case "/arduino/weather": recieveWeatherData(response);
        return;
        // Do a arduino request for the calibration
        case "/arduino/calibrate": dbGps.calibrateLocation(HARDCODE_BOAT, response);
        break;
        // Do a request for all the boat info there is
        case "/client/boats": dbGps.getAllBoatInfo(response);
        break;
        // Do a request for location information about one boat
        case "/client/boatlocation": 
        try {
            fileManager.loadLocationCache(getObject.boat_name, response);
        }
        catch(error) {
            httpUtil.endResponse(response, httpUtil.BAD_REQUEST);
        }
        break;
        // Do a request for the status of the boat (by checking distance)
        case "/client/boatstatus": 
        try{
            dbGps.checkDistanceWithBaseLocation(getObject.boat_name, (result, error) => {
                httpUtil.endResponse(response, error ? httpUtil.NO_CONTENT : httpUtil.OK, JSON.stringify(result));
            });
        }
        catch(error) { 
            httpUtil.endResponse(response, httpUtil.BAD_REQUEST);
        }
        break;
        // Do a request for specific resources
        default : fileManager.loadFile(request.url.substring(1), response);
    }
}


