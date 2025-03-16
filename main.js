const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
    }
  });

  win.loadFile('homepage/homepage.html').catch(err => {
    console.error('Failed to load homepage:', err);
  });
}

app.whenReady().then(createWindow).catch(err => {
  console.error('Failed to create window:', err);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
