const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  // Check if running from command line (npm run electron-dev) or built app
  // If ELECTRON_START_URL is set or we're in dev, use dev server
  const isDev = process.env.ELECTRON_START_URL || process.env.NODE_ENV === 'development' || !fs.existsSync(path.join(__dirname, 'dist/index.html'));
  
  if (isDev || process.env.ELECTRON_START_URL) {
    win.loadURL(process.env.ELECTRON_START_URL || 'http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, 'dist/index.html');
    win.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});