/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import { ipcRenderer } from 'electron';
import './css/index.css';

console.log('👋 This message is being logged by "renderer.js", included via webpack');

let selectedEvent:any;

// When the action-update-label event is triggered (from the main process)
// Do something in the view
ipcRenderer.on('action', (event, arg) => {
    var selectEl = document.getElementById('cars');
    console.log(selectEl)
    const optionEl = document.createElement("option");
    
    optionEl.appendChild( document.createTextNode(arg.event_id) );

    // set value property of opt
    optionEl.value = arg.event_id; 

    // add opt to end of select box (sel)
    selectEl.appendChild(optionEl); 
});

ipcRenderer.on('docker-restart-finished-success', (event) => {
    console.log("finished docker restart successfully") // prints "pong"
    document.getElementById("button").removeAttribute("disabled");
    document.getElementById("lds-ring-wrapper").setAttribute("style", "display: none;");
})

ipcRenderer.on('docker-restart-finished-failed', (event) => {
    console.log("finished docker restart unsuccessfully") // prints "pong"
    document.getElementById("button").removeAttribute("disabled");
    document.getElementById("lds-ring-wrapper").setAttribute("style", "display: none;");
})

document.getElementById("lds-ring-wrapper").setAttribute("style", "display: none;");

document.getElementById('button').addEventListener('click', () => {
    document.getElementById("button").setAttribute("disabled", "true");
    document.getElementById("lds-ring-wrapper").setAttribute("style", "display: inline-block;");
    saveConfigFile()
})

document.getElementById("cars").onchange = function(evt:any){
    selectedEvent = evt.target.value
};

function saveConfigFile() {
    console.log(selectedEvent)
    ipcRenderer.send('save-config', selectedEvent)
}
