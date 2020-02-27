// Time table constants
const PAST_STEPS = 4;
const FORWARD_STEPS = 8;
const TOTAL_STEPS = PAST_STEPS + FORWARD_STEPS + 1; // +1 for current time aswell
const TIME_STEP_MINUTES = 30;

function call() {
	// For now the names are hard coded
	var boatList = ["qwr", "qwe", "rqw", "rqt", "wda"];
	var timeList = new Array(TOTAL_STEPS);

	var boatTable = document.querySelector("#boat-table");

	// Get time variables
	var currentTime = new Date();

	// Start the table
	var totalTable = "<tr> <th> -/- </th>";
		
	// Add all the times above the table
	for (var iTime = 0; iTime < TOTAL_STEPS; iTime++) {
		timeList[iTime] = GetTimeStepOnIndex(currentTime, iTime - PAST_STEPS);
		totalTable += "	<th>" + timeList[iTime] + "</th>";
	}	
	totalTable += "</tr>";
	
	// Get all the boats and add them to a table
	for(var iBoat = 0; iBoat < boatList.length; iBoat++) 
	{
		totalTable += "<tr class='boat-name'><th>" + boatList[iBoat] + "</th>";
			
		for (var iTime = 0; iTime < TOTAL_STEPS; iTime++) {
			totalTable += "	<th><input class='" + timeList[iTime] + "' type='button'></th>";
		}
		
		totalTable += "</tr>";
	}
	
	// Assign value to the table
	boatTable.innerHTML = totalTable;
}

function GetTimeStepOnIndex(currentTime, timeStep) {
	var minutes = currentTime.getMinutes() + currentTime.getHours() * 60;
	minutes += timeStep * TIME_STEP_MINUTES;

	// 1440 minutes in a day (capping the minutes to normal values)
	if(minutes < 0 || minutes > 1440)
		minutes += (minutes < 0) ? 1440 : -1440;

	// Convert the left over minutes to hours
	var hours = (minutes - currentTime.getMinutes() % TIME_STEP_MINUTES) / 60; 

	// Set the minutes on 00 or 30 depending on the closest value to the current minutes
	minutes = hours % 1 == 0 ? "00" : "30";
	hours = Math.floor(hours);

	// Return the hours and minutes
	return hours  + ":" + minutes;
}


function CallPopup() {
	var popup = document.querySelector("#popup");
	popup.style.display = "none";
}