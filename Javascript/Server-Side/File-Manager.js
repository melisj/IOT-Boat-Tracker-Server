const fs = require("fs");

// Load a file from the root of the server
function loadFile(path) {
    // Default message for the server
    var file = "404 File was lost in space";

    // Get the path as requested
    try {
        file = fs.readFileSync(path);
    }
    // If that doesnt work, try to get the html path
    catch(error) {
        file = loadHtmlFileFallback(path);
    }

    return file;
}

// Function to fall back to when a file was not found
// Function will try to return a html file in the HTML folder
function loadHtmlFileFallback(path) {
    var file

    // Add html to the path
    try { file = fs.readFileSync("HTML/" + path + ".html"); }
    catch(error) { console.error(error); }

    return file;
}

module.exports.loadFile = loadFile;