const { app, BrowserWindow } = require('electron');
const path = require('path');
const { initializeGit } = require('./ipc-handlers');

let win;

function createWindow() {
  win = new BrowserWindow({ 
    width: 900, 
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  // Angular 17+ uses browser subdirectory
  win.loadFile('dist/my-electron-app/browser/index.html');
  
  // Open devtools automatically in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
  
  win.on('closed', () => { win = null; });

  initializeGit(win);
}

app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (win === null) createWindow(); });
