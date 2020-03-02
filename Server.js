const http = require("http");
const queryParser = require("querystring");
const weather = require("./Javascript/Server-Side/Weather-API");
const database = require("./Javascript/Server-Side/GPS-Database");
const fileManager = require("./Javascript/Server-Side/File-Manager");

const HARDCODE_BOAT = "viermineen";

// Create a server
const server = http.createServer((request, response) => {
    console.log(request.url);
   
    // Catch errors
    request.on("error", (error) => console.log(error));

    // Check if this request has access to the requested files
    if(isRequestRestricted(request.url)) {
        response.end("Who do you think you are!");
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
        database.calibrateLocation(postObject, HARDCODE_BOAT, response);
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
        // Do a arduino request for the calibration (DONT USE YET)
        case "/arduino/calibrate": database.calibrateLocation(response);
        break;
        // Do a request for specific resources
        default : response.end(fileManager.loadFile(request.url.substring(1)));
    }
}