function createTimestampSQL(){
    var currentTime = new Date();

    // Format "YYYY-MM-DD HH:MM:SS"
    return currentTime.getFullYear() + "-" + currentTime.getDate() + "-" + currentTime.getDay() + " " +
    currentTime.getHours() + ":" + currentTime.getMinutes() + ":" + currentTime.getSeconds();

    
}

function createTimestampSQLInput(hourMinuteTime){
    var currentTime = new Date();

    // Format "YYYY-MM-DD HH:MM:SS"
    return currentTime.getFullYear() + "-" + currentTime.getDate() + "-" + currentTime.getDay() + " " +
    hourMinuteTime + ":00";
}

module.exports.createTimestampSQL = createTimestampSQL;
module.exports.createTimestampSQLInput = createTimestampSQLInput;