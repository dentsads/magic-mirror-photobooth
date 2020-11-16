import { app, BrowserWindow, ipcMain, nativeImage } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { FormFields } from './renderer';
var exec = require('child_process').exec
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

const image = nativeImage.createFromPath(app.getAppPath() + '/src/img/fotospiegelwelt_logo_02_140x149.png');

image.setTemplateImage(true);

const basePath = os.homedir() + "/.magic-mirror-photobooth"
const eventPath = basePath + "/events"

let mainWindow: BrowserWindow;


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window. 
  // See here: https://www.electronjs.org/docs/api/browser-window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1200,
    center: true,    
    kiosk: false,
    icon: image,
    autoHideMenuBar: true,
    backgroundColor: 'light',
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();

  mainWindow.setTitle(app.getName() + ' - v' + app.getVersion());

  mainWindow.webContents.once('dom-ready', () => {
    fs.readdir(eventPath, function (err:any, dir:any) {
      //handling error
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      }
      //listing all files using forEach
      dir.forEach(function (subdir:any) {
          let metadataPath = path.join( eventPath, subdir , '/metadata.json')
  
          console.log( metadataPath );
  
          var metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

          mainWindow.webContents.send('populate-events-dropdown', metadata)
  
      });
    });
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('save-and-start', (event, formFields: FormFields) => {
  let config = JSON.parse(fs.readFileSync(basePath + "/config.json", 'utf8'));
  config.event_id = formFields.event_id;
  config.maxNumberOfPhotos = formFields.maxNumberOfPhotos;
  config.maxNumberOfPrints = formFields.maxNumberOfPrints;
  config.phone_number = formFields.phone_number;
  config.website = formFields.website;

  console.log(config)

  fs.writeFile(basePath + "/config.json", JSON.stringify(config), function (err:any) {
    if (err) {
      console.log(err);
      return event.reply('saving-config-finished-failed', err)
    }
    console.log(basePath + "/config.json written successfully");

    exec('docker restart magic-mirror-photobooth', (error:any, stdout:any, stderr:any) => {
      if (error) {
        event.reply('docker-restart-finished-failed', error)
      } else {
        exec('docker restart magic-mirror-photobooth-upload', (error:any, stdout:any, stderr:any) => {
          if (error) {
            event.reply('docker-restart-finished-failed', error)
          } else {
            // first stop all running mkiosk instances and then restart mkiosk, otherwise it opens up a new session every time
            exec('systemctl --user stop mkiosk && systemctl --user start mkiosk', (error:any, stdout:any, stderr:any) => {
              if (error) {
                event.reply('docker-restart-finished-failed', error)
              } else {
                event.reply('docker-restart-finished-success')
              }
            }); 
          }
        });        
      }
    });
  });
})

ipcMain.on('stop', (event) => {
  exec('systemctl --user stop mkiosk', (error:any, stdout:any, stderr:any) => {
    if (error) {
      event.reply('stop-finished-failed', error)
    } else {
      event.reply('stop-finished-success')
    }
  }); 
})

ipcMain.on('event-data-request', (event, eventId) => {
  if (eventId == "select")
    event.reply('event-data-response', "empty")

  var config = JSON.parse(fs.readFileSync(basePath + "/config.json", 'utf8'));

  fs.readdir(eventPath, function (err:any, dir:any) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    dir.forEach(function (subdir:any) {
        let metadataPath = path.join( eventPath, subdir , '/metadata.json')
        var metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

        if (metadata.event_id == eventId)
          event.reply('event-data-response', { "config": config, "metadata": metadata })

    });
  });
  
})