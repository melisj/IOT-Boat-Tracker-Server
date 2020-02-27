function call() {
	// For now the names are hard coded
	var boatList = ["dwaf", "dwdawd", "dawdaf", "awdfwaev"];

	var boatTable = document.querySelector("#boat-table");

	// Start the table
	var totalTable = "<tr> <th> -/- </th>";
		
	// Add all the times above the table
	for (var iTime = 0; iTime < 10; iTime++) {
		totalTable += "	<th>" + "10:00" + "</th>";
	}	
	totalTable += "</tr>";
	
	// Get all the boats and add them to a table
	for(var iBoat = 0; iBoat < boatList.length; iBoat++) 
	{
		var table = "<tr class='boat-name'><th>" + boatList[iBoat] + "</th>";
			
		for (var iTime = 0; iTime < 10; iTime++) {
			table += "	<th><input class='timestamp' type='button' onclick=''></input> </th>";
		}
		
		table += "</tr>";
		
		totalTable += table;
	}
	
	// Assign value to the table
	boatTable.innerHTML = totalTable;
}