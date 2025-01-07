const { app, BrowserWindow} = require('electron');

if (require('electron-squirrel-startup')) app.quit();

let mainWindow;

app.on('ready', () =>{

    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: './frontend/assets/img/moeda.ico'
    })
    
    mainWindow.loadURL(`file://${__dirname}/frontend/views/index.html`)

});