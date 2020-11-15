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
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/index.css';

let selectedEvent:any;

let maxNumberOfPhotosEl:HTMLElement = document.getElementById('maxNumberOfPhotos');
Array.from(Array(4).keys()).slice(1).forEach( (element:number) => {
    const optionEl = document.createElement("option");
    optionEl.appendChild(document.createTextNode(element.toString()));
    optionEl.value = element.toString();     
    maxNumberOfPhotosEl.appendChild(optionEl); 
});

let maxNumberOfPrintsEl:HTMLElement = document.getElementById('maxNumberOfPrints');
Array.from(Array(6).keys()).forEach( (element:number) => {
    const optionEl = document.createElement("option");
    optionEl.appendChild(document.createTextNode(element.toString()));
    optionEl.value = element.toString();     
    maxNumberOfPrintsEl.appendChild(optionEl); 
});

// When the action-update-label event is triggered (from the main process)
// Do something in the view
ipcRenderer.on('populate-events-dropdown', (event, metadata) => {
    let mirrorEventsEl = document.getElementById('mirrorEvents');    

    const optionEl = document.createElement("option");

    let separator:string = (metadata.description as string).length == 0 ? '' : ' - '
    optionEl.appendChild(document.createTextNode(metadata.event_id + separator + metadata.description));
    optionEl.value = metadata.event_id;     
    mirrorEventsEl.appendChild(optionEl);     
});

ipcRenderer.on('docker-restart-finished-success', (event) => {
    console.log("finished docker restart successfully") // prints "pong"
    enableButton("mirrorEventButton");
    document.getElementById("mirrorEventButtonSpinner").classList.add("sr-only");
})

ipcRenderer.on('docker-restart-finished-failed', (event) => {
    console.log("finished docker restart unsuccessfully") // prints "pong"
    enableButton("mirrorEventButton");
    document.getElementById("mirrorEventButtonSpinner").classList.add("sr-only");
})

ipcRenderer.on('event-data-response', (event, data) => {
    if (data == "empty") {
        setFormFiels({
            event_id: "",
            maxNumberOfPhotos: "select",
            maxNumberOfPrints: "select",
            phone_number: "",
            website: ""
        });
        disableButton("mirrorEventButton");
    } else {
        setFormFiels({
            event_id: data.metadata.event_id,
            maxNumberOfPhotos: data.config.maxNumberOfPhotos,
            maxNumberOfPrints: data.config.maxNumberOfPrints,
            phone_number: data.config.phone_number,
            website: data.config.website
        });
        enableButton("mirrorEventButton");
    }        
    
})

document.getElementById('mirrorEventButton').addEventListener('click', () => {
    disableButton("mirrorEventButton");
    document.getElementById("mirrorEventButtonSpinner").classList.remove("sr-only");
    saveConfigFile()
})

document.getElementById("mirrorEvents").onchange = function(evt:any){
    ipcRenderer.send('event-data-request', evt.target.value)
};

function saveConfigFile() {    
    ipcRenderer.send('save-and-start', getFormFiels())
}

function enableButton(buttonId: string) {
    document.getElementById(buttonId).removeAttribute("disabled");
}

function disableButton(buttonId: string) {
    document.getElementById(buttonId).setAttribute("disabled", "true");
}

function setFormFiels(fieldValues: FormFields) {
    let maxNumberOfPhotosEl:HTMLSelectElement = (document.getElementById('maxNumberOfPhotos') as HTMLSelectElement);
    let maxNumberOfPrintsEl:HTMLSelectElement = (document.getElementById('maxNumberOfPrints') as HTMLSelectElement);    
    let galleryCodeEl:HTMLTextAreaElement = (document.getElementById("galleryCode") as HTMLTextAreaElement);
    let phoneNumberEl:HTMLTextAreaElement = (document.getElementById("phoneNumber") as HTMLTextAreaElement);
    let websiteEl:HTMLTextAreaElement = (document.getElementById("website") as HTMLTextAreaElement);

    maxNumberOfPhotosEl.value = fieldValues.maxNumberOfPhotos;
    maxNumberOfPrintsEl.value = fieldValues.maxNumberOfPrints;
    galleryCodeEl.value = fieldValues.event_id;
    phoneNumberEl.value = fieldValues.phone_number;
    websiteEl.value = fieldValues.website;
}

function getFormFiels(): FormFields {    
    let maxNumberOfPhotosEl:HTMLSelectElement = (document.getElementById('maxNumberOfPhotos') as HTMLSelectElement);
    let maxNumberOfPrintsEl:HTMLSelectElement = (document.getElementById('maxNumberOfPrints') as HTMLSelectElement);    
    let galleryCodeEl:HTMLTextAreaElement = (document.getElementById("galleryCode") as HTMLTextAreaElement);
    let phoneNumberEl:HTMLTextAreaElement = (document.getElementById("phoneNumber") as HTMLTextAreaElement);
    let websiteEl:HTMLTextAreaElement = (document.getElementById("website") as HTMLTextAreaElement);
    
    return {
        event_id: galleryCodeEl.value,
        maxNumberOfPhotos: maxNumberOfPhotosEl.value,
        maxNumberOfPrints: maxNumberOfPrintsEl.value,
        phone_number: phoneNumberEl.value,
        website: websiteEl.value,
    }
}

export interface FormFields {
    event_id: string;
    maxNumberOfPhotos: string;
    maxNumberOfPrints: string;
    phone_number: string;
    website: string;
}