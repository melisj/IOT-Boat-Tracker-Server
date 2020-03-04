// Script will be called to create the renting table with the current time.
// This script will also make a call to the server for all the boat names.

// Time table constants
const PAST_STEPS = 4;
const FORWARD_STEPS = 8;
const TOTAL_STEPS = PAST_STEPS + FORWARD_STEPS + 1; // +1 for current time aswell
const TIME_STEP_MINUTES = 30;

// Function to be called to start the initialization of the table
function requestTable() {
	getAllTheBoats();
	
}

// Construct the table with the data
function createTable(boatList) {
	var timeList = new Array(TOTAL_STEPS);

	var boatTable = document.querySelector("#boat-table");

	console.log(boatList[iBoat]);

	// Get time variables
	var currentTime = new Date();

	// Start the table
	var totalTable = "<tr> <th> -/- </th>";
		
	// Add all the times above the table
	for (var iTime = 0; iTime < TOTAL_STEPS; iTime++) {
		timeList[iTime] = getTimeStepOnIndex(currentTime, iTime - PAST_STEPS);
		totalTable += "	<th>" + timeList[iTime] + "</th>";
	}	
	totalTable += "</tr>";
	
	// Get all the boats and add them to a table
	for(var iBoat = 0; iBoat < boatList.length; iBoat++) 
	{
		totalTable += "<tr class='boat-name " + boatList[iBoat].name + "'><th>" + boatList[iBoat].name + "</th>";
			
		for (var iTime = 0; iTime < TOTAL_STEPS; iTime++) {
			totalTable += "	<th><input class='button " + timeList[iTime] + " " + boatList[iBoat].name + "' type='button' onclick='togglePopup(this)'></th>";
		}
		
		totalTable += "</tr>";
	}
	
	// Assign value to the table
	boatTable.innerHTML = totalTable;
}

// Return the time in steps of 30 minutes
// Index will determine if the step should be back or forwards in time
function getTimeStepOnIndex(currentTime, timeStep) {
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

// Get all the boats that are stored in the database
function getAllTheBoats() {
	var ajax = new XMLHttpRequest();

	ajax.open("GET", "/client/boatinfo");
	
	ajax.onreadystatechange = () => {
		if(ajax.readyState == 4 && ajax.status == 200) {
			createTable(JSON.parse(ajax.responseText));
		}
	};

	ajax.send();
}