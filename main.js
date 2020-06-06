const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');



function checkupdates(){   
     mainWindow.maximize();
     mainWindow.show();
     autoUpdater.checkForUpdatesAndNotify();

}


let mainWindow; //do this so that the window object doesn't get GC'd

function createWindow(){

    mainWindow = new BrowserWindow({show:false,webPreferences:{nodeIntegration :true} });
   

     mainWindow.once('ready-to-show',checkupdates);
    
    // The BrowserWindow class extends the node.js core EventEmitter class, so we use that API
    // to listen to events on the BrowserWindow. The resize event is emitted when the window size changes.
   /* mainWindow.on('resize', () => {
      
    });*/

    mainWindow.loadURL('file://' + path.join(__dirname, 'index.html'));
   // mainWindow.webContents.openDevTools();
    mainWindow.setMenu(null);
   

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

   


};

// First instantiate the class



// When our app is ready, we'll create our BrowserWindow
app.on('ready', createWindow);


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});





