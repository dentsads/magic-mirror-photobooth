const { ipcRenderer } = require('electron');

let selectedEvent;

// When the action-update-label event is triggered (from the main process)
// Do something in the view
ipcRenderer.on('action', (event, arg) => {
    var selectEl = document.getElementById('cars');

    const optionEl = document.createElement("option");

    optionEl.appendChild( document.createTextNode(arg.event_id) );

    // set value property of opt
    optionEl.value = arg.event_id; 

    // add opt to end of select box (sel)
    selectEl.appendChild(optionEl); 
});

ipcRenderer.on('docker-restart-finished-success', (event) => {
    console.log("finished docker restart successfully") // prints "pong"
    document.getElementById("button").disabled = false;
    document.getElementById("lds-ring-wrapper").style = "display: none;";
})

ipcRenderer.on('docker-restart-finished-failed', (event) => {
    console.log("finished docker restart unsuccessfully") // prints "pong"
    document.getElementById("button").disabled = false;
    document.getElementById("lds-ring-wrapper").style = "display: none;";
})

document.getElementById("lds-ring-wrapper").style = "display: none;";

document.getElementById('button').addEventListener('click', () => {
    document.getElementById("button").disabled = true;
    document.getElementById("lds-ring-wrapper").style = "display: inline-block;";
    saveConfigFile()
})

document.getElementById("cars").onchange = function(evt){
    selectedEvent = evt.target.value
};

function saveConfigFile() {
    console.log(selectedEvent)
    ipcRenderer.send('save-config', selectedEvent)
}