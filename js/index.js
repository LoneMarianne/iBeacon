// Udarbejdet på baggrund af
//https://github.com/don/cordova-plugin-ble-central


// ASCII only
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

// this is ble hm-10 UART service
var blue= {
    serviceUUID: "0000FFE0-0000-1000-8000-00805F9B34FB",
    characteristicUUID: "0000FFE1-0000-1000-8000-00805F9B34FB"
};
var ConnDeviceId;
 var deviceList =[];
 
function onLoad(){
	document.addEventListener('deviceready', onDeviceReady, false);
       // refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
       // sendButton.addEventListener('click', this.sendData, false);
      //  disconnectButton.addEventListener('touchstart', this.disconnect, false);
      bleDeviceList.addEventListener('touchstart', this.conn, false); // assume not scrolling
	
	
}

function onDeviceReady(){
	refreshDeviceList();
}

	 
function refreshDeviceList(){
	document.getElementById("bleDeviceList").innerHTML = ''; // empties the list
        if (cordova.platformId === 'android') { // Android filtering is broken
            ble.scan([], 5, onDiscoverDevice, onError);
        } else {
			//alert("Disconnected");
            ble.scan([blue.serviceUUID], 5, onDiscoverDevice, onError);
        }
}



function onDiscoverDevice(device){
	deviceList.push(device);
	var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b>';

       // listItem.dataset.deviceId = device.id;
        listItem.innerHTML = html;
        	document.getElementById("bleDeviceList").appendChild(listItem);
	
}



function conn(e){
	 n= e.srcElement.innerHTML;
	// document.getElementById("tjo").innerHTML = event.srcElement.innerHTML;
	 // alert(event.srcElement.id);
	 for(i=0;i<device.length;i++)
		 if(device[i].name ==n) ConnDeviceId= device[i].id;
	 else ConnDeviceId="Ikke fundet";
	document.getElementById("debugDiv").innerHTML 	= "test : "+ ConnDeviceId;
 }


	
function onConnect(){
	document.getElementById("statusDiv").innerHTML = " Status: Connected";
	document.getElementById("bleId").innerHTML = ConnDeviceId;
	 ble.startNotification(ConnDeviceId, blue.serviceUUID, blue.characteristicUUID, onData, onError);
}

function onConnError(){
	alert("Problem connecting");
	document.getElementById("statusDiv").innerHTML = " Status: Disonnected";
}

 function onData(data){ // data received from Arduino
	//console.log(data);
	document.getElementById("resultDiv").innerHTML +=  "Received: " + bytesToString(data) + "<br/>";
   // resultDiv.scrollTop = resultDiv.scrollHeight;
}
function sendData() { // send data to Arduino
/*
	var success = function() {
		console.log("success");
		resultDiv.innerHTML = resultDiv.innerHTML + "Sent: " + messageInput.value + "<br/>";
		resultDiv.scrollTop = resultDiv.scrollHeight;
	};

	var failure = function() {
		alert("Failed writing data to the redbear hardware");
	};*/

	var data = stringToBytes(messageInput.value);
	//var deviceId = event.target.dataset.deviceId;
	ble.writeWithoutResponse(deviceId, blue.serviceUUID, blue.characteristicUUID, data, onSend, onError);

}
	
function onSend(){
	document.getElementById("resultDiv").innerHTML += "Sent: " + messageInput.value + "<br/>";
}

function disconnect() {
   // var deviceId = event.target.dataset.deviceId;
	ble.disconnect(deviceId, onDisconnect, onError);
}

function onDisconnect(){
	document.getElementById("statusDiv").innerHTML = "Status: Disconnected";
}
function onError(reason)  {
	alert("ERROR: " + reason); // real apps should use notification.alert
}

	
