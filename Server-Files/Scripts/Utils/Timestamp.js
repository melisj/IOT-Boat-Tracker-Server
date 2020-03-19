// Functions for creating a SQL timestamp

function createTimestampSQL(){
    var currentTime = new Date();

    // Format "YYYY-MM-DD HH:MM:SS"
    return currentTime.getFullYear() + "-" + (currentTime.getMonth() + 1) + "-" +  currentTime.getDate()  + " " +
    currentTime.getHours() + ":" + currentTime.getMinutes() + ":" + currentTime.getSeconds();
}

function createTimestampSQLGivenTime(time){
    // Format "YYYY-MM-DD HH:MM:SS"
    return time.getFullYear() + "-" + (time.getMonth() + 1) + "-" +  time.getDate() + " " +
    time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
}

function createTimestampSQLTimeCurrentDay(hourMinuteTime){
    var currentTime = new Date();

    // Format "YYYY-MM-DD HH:MM:SS"
    return currentTime.getFullYear() + "-" + (currentTime.getMonth() + 1) + "-" +  currentTime.getDate() + " " +
    hourMinuteTime + ":00";
}

module.exports.createTimestampSQL = createTimestampSQL;
module.exports.createTimestampSQLTimeCurrentDay = createTimestampSQLTimeCurrentDay;
module.exports.createTimestampSQLGivenTime = createTimestampSQLGivenTime;