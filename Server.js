const http = require("http");
const fs = require("fs");
const weather = require("./Javascript/Server-Side/Weather-API");

// Create a server
const server = http.createServer((req, res) => {
    console.log(req.url);
   
    // Check if this request has access to the requested files
    if(isRequestRestricted(req.url)) {
        res.write("Access denied for these files");
        res.end();
        return;
    }

    switch(req.url)
    {
        // Do a homepage request
        case "/" : res.write(loadFile("HTML/GPS.html"));
        break;
        // Do a arduino request for the weather (close response when data is collected)
        case "/arduino/weather": retrieveWeatherData(res);
        return;
        // Do a request for specific resources
        default : res.write(loadFile(req.url.substring(1)));
        break; 
    }

    res.end();
});
server.listen(8080);

// Load a file from the root of the server
function loadFile(path) {
    // Default message for the server
    var file = "404 File was lost in space";

    // Get the path as is
    try {
        file = fs.readFileSync(path);
    }
    // If it doesnt work, try to get the html path
    catch(error) {
        try {
            file = fs.readFileSync("HTML/" + path + ".html");
        }
        catch(error) {
            console.error(error);
        }
    }

    return file;
}

function isRequestRestricted(requestString) {
    requestString = requestString.toLowerCase();

    // Keep requests for anything that has to do with the server out of the requests
    if(requestString.includes("server")){
        return true;
    }

    return false;
}

// Request weather info and send this info back in JSON
function retrieveWeatherData(responsObj) {
    weather.requestWeather();

    weather.on("recieved", (data) => {
        console.log(data);

        responsObj.write(JSON.stringify(data));
        responsObj.end();
    });
}

