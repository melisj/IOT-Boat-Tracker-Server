const ajax = new XMLHttpRequest();


// This function will handle a request to the server without any object attached to the address
function doRequestForData(callback, address) {
	ajax.open("GET", address);
	
	ajax.onreadystatechange = () => {
		if(ajax.readyState == 4 && ajax.status == 200) {
			// Recieve data and parse it to an object
			if(ajax.responseText != "")
				callback(JSON.parse(ajax.responseText));
			else
				callback(null);
		}
	};

	ajax.send();
}