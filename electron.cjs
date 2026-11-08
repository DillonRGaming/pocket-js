const { app: electronApp, BrowserWindow } = require('electron');
const path = require('path');

const express = require('express');
const cors = require('cors');

let mainWindow;
let server;

function startServer() {
  const serverApp = express();
  serverApp.use(cors());
  serverApp.use(express.static(path.join(__dirname, 'main')));
  serverApp.get('/api/health', (req, res) => {
    res.json({ ok: true, mode: 'static-only' });
  });
  return new Promise((resolve) => {
    server = serverApp.listen(8000, () => {
      console.log('Server running on http://localhost:8000');
      resolve();
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 720,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    backgroundColor: '#080A1A'
  });

  mainWindow.loadURL('http://localhost:8000');
  mainWindow.on('closed', () => { mainWindow = null; });
}

electronApp.on('ready', async () => {
  await startServer();
  createWindow();
});

electronApp.on('window-all-closed', () => {
  if (server) server.close();
  if (process.platform !== 'darwin') electronApp.quit();
});

electronApp.on('activate', () => {
  if (mainWindow === null) createWindow();
});
