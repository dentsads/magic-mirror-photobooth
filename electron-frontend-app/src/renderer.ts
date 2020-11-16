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
    console.log("finished docker restart successfully");
    enableButton("mirrorEventButtonStart");
    enableButton("mirrorEventButtonStop");
    document.getElementById("mirrorEventButtonStartSpinner").classList.add("sr-only");

    showAlert(AlertType.success, "Event-Lauf wurde erfolgreich gestartet." , 3);
})

ipcRenderer.on('stop-finished-success', (event) => {
    console.log("finished stopping mkiosk systemd service successfully");
    enableButton("mirrorEventButtonStart");
    enableButton("mirrorEventButtonStop");
    document.getElementById("mirrorEventButtonStopSpinner").classList.add("sr-only");

    showAlert(AlertType.success, "Event-Lauf wurde erfolgreich gestoppt." , 3);
})

ipcRenderer.on('docker-restart-finished-failed', (event, error) => {
    console.log("finished docker restart unsuccessfully");
    enableButton("mirrorEventButtonStart");    
    document.getElementById("mirrorEventButtonStartSpinner").classList.add("sr-only");   
    
    showAlert(AlertType.danger, error);
})

ipcRenderer.on('saving-config-finished-failed', (event, error) => {
    console.log("saving config file failed");
    enableButton("mirrorEventButtonStart");    
    document.getElementById("mirrorEventButtonStartSpinner").classList.add("sr-only");   
    
    showAlert(AlertType.danger, error);
})

ipcRenderer.on('stop-finished-failed', (event, error) => {
    console.log("stopping mkiosk systemd service unsuccessful");
    enableButton("mirrorEventButtonStart");
    enableButton("mirrorEventButtonStop");    
    document.getElementById("mirrorEventButtonStopSpinner").classList.add("sr-only");   
    
    showAlert(AlertType.danger, error);
})

ipcRenderer.on('event-data-response', (event, data) => {
    if (data == "empty") {
        setFormFields({
            event_id: "",
            maxNumberOfPhotos: "select",
            maxNumberOfPrints: "select",
            phone_number: "",
            website: ""
        });
        disableButton("mirrorEventButtonStart");
    } else {
        setFormFields({
            event_id: data.metadata.event_id,
            maxNumberOfPhotos: data.config.maxNumberOfPhotos,
            maxNumberOfPrints: data.config.maxNumberOfPrints,
            phone_number: data.config.phone_number,
            website: data.config.website
        });
        enableButton("mirrorEventButtonStart");
    }        
    
})

document.getElementById('mirrorEventButtonStart').addEventListener('click', () => {
    disableButton("mirrorEventButtonStart");
    disableButton("mirrorEventButtonStop");
    document.getElementById("mirrorEventButtonStartSpinner").classList.remove("sr-only");
    
    showAlert(AlertType.primary, "Event-Lauf wird gestartet. Dies kann einige Sekunden dauern. Bitte haben Sie Geduld." , 5);
    ipcRenderer.send('save-and-start', getFormFields());
})

document.getElementById('mirrorEventButtonStop').addEventListener('click', () => {
    disableButton("mirrorEventButtonStart");
    disableButton("mirrorEventButtonStop");
    document.getElementById("mirrorEventButtonStopSpinner").classList.remove("sr-only");
    
    showAlert(AlertType.primary, "Event-Lauf wird gestoppt." , 3);
    ipcRenderer.send('stop');
})

document.getElementById("mirrorEvents").onchange = function(evt:any){
    ipcRenderer.send('event-data-request', evt.target.value)
};

function enableButton(buttonId: string) {
    document.getElementById(buttonId).removeAttribute("disabled");
}

function disableButton(buttonId: string) {
    document.getElementById(buttonId).setAttribute("disabled", "true");
}

function showAlert(type: AlertType, message: string, timeout?: number) {
    console.log('alert-' + AlertType[type]);
    let alertEl = document.getElementById('alert-' + AlertType[type]);

    alertEl.classList.remove("sr-only");   
    alertEl.getElementsByTagName('div').item(0).textContent = message;

    let timeoutInSecs = timeout ? timeout : 60;

    setTimeout(function(){
        alertEl.classList.add("sr-only");
    }, 1000*timeoutInSecs);
}

function setFormFields(fieldValues: FormFields) {
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

function getFormFields(): FormFields {    
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

enum AlertType {
    danger, // red
    primary, // blue
    success, // green
    warning // yellow
  }