// (c) 2014 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global mainPage, deviceList, refreshButton */
/* global detailPage, resultDiv, messageInput, sendButton, disconnectButton */
/* global ble, cordova  */
/* jshint browser: true , devel: true*/
'use strict';

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

// this is RedBear Lab's UART service
var blue= {
    serviceUUID: "0000FFE0-0000-1000-8000-00805F9B34FB",
    characteristicUUID: "0000FFE1-0000-1000-8000-00805F9B34FB"
};

var app = {
	deviceId: "",
    initialize: function() {
        this.bindEvents();
        //detailPage.hidden = true;
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
        onButton.addEventListener('click', this.buttonOn, false);
		 offButton.addEventListener('click', this.buttonOff, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
        deviceList.addEventListener('touchstart', this.connect, false); // assume not scrolling
    },
    onDeviceReady: function() {
        app.refreshDeviceList();
    },
    refreshDeviceList: function() {
        deviceList.innerHTML = ''; // empties the list
        if (cordova.platformId === 'android') { // Android filtering is broken
            ble.scan([], 5, app.onDiscoverDevice, app.onError);
        } else {
			alert("Disconnected");
            ble.scan([blue.serviceUUID], 5, app.onDiscoverDevice, app.onError);
        }
    },
    onDiscoverDevice: function(device) {
        var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/>' +
                'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                device.id;

        listItem.dataset.deviceId = device.id;
        listItem.innerHTML = html;
        deviceList.appendChild(listItem);
    },
    connect: function(e) {
		 app.deviceId = e.target.dataset.deviceId;
        //var deviceId = e.target.dataset.deviceId,
            onConnect = function() {
                // subscribe for incoming data
				 ble.startNotification(app.deviceId, blue.serviceUUID, blue.characteristicUUID, app.onData, app.onError);
                sendButton.dataset.deviceId = app.deviceId;
                disconnectButton.dataset.deviceId = app.deviceId;
               // app.showDetailPage
			   macDiv.innerHTML = app.deviceId;
            };

        ble.connect(app.deviceId, onConnect, app.onError);
    },
    onData: function(data) { // data received from Arduino
        console.log(data);
        resultDiv.innerHTML = resultDiv.innerHTML + "Received: " + bytesToString(data) + "<br/>";
        resultDiv.scrollTop = resultDiv.scrollHeight;
    },
	buttonOn: function(event){
		app.sendData("1");
	},
	buttonOff: function(event){
		app.sendData("0");
	},
	sendData: function(msg) { // send data to Arduino
	   
        var success = function() {
            console.log("success");
           resultDiv.innerHTML = resultDiv.innerHTML + "Sent: " + msg + "<br/>";
            resultDiv.scrollTop = resultDiv.scrollHeight;
        };

        var failure = function() {
            alert("Failed writing data to the Arduino");
        };

        var data = stringToBytes(msg);
       // var deviceId = event.target.dataset.deviceId;
        ble.writeWithoutResponse(app.deviceId, blue.serviceUUID, blue.characteristicUUID, data, success, failure);

    },
	
    disconnect: function(event) {
        //var deviceId = event.target.dataset.deviceId;
        ble.disconnect(app.deviceId, app.showMainPage, app.onError);
    },
    showMainPage: function() {
      //  mainPage.hidden = false;
      //  detailPage.hidden = true;
    },
    showDetailPage: function() {
      //  mainPage.hidden = true;
      //  detailPage.hidden = false;
    },
    onError: function(reason) {
        alert("ERROR: " + reason); // real apps should use notification.alert
    }
};
