import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { uIOhook } from 'uiohook-napi';
import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize electron store
const store = new Store({
  defaults: {
    typingData: [], // Array of { timestamp, wpm }
    fastestWPM: 0
  }
});

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f172a', // Slate 900
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Prevent app from quitting when the window is closed, just hide it
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../build/icon.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  
  tray = new Tray(icon);
  tray.setToolTip('TypeTrace');
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Open Dashboard', 
      click: () => {
        mainWindow?.show();
      }
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow?.show();
  });
}

// Typing speed state
let keystrokesInLastMinute: number[] = [];
const WPM_INTERVAL = 1000; // 1 second updates

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });

  createTray();
  setupKeylogger();
});

// We no longer quit when all windows are closed, because we want it to run in the background
app.on('window-all-closed', () => {
  // Do nothing to keep the app running in the tray
});

function setupKeylogger() {
  uIOhook.on('keydown', (_e) => {
    const now = Date.now();
    keystrokesInLastMinute.push(now);
  });

  try {
    uIOhook.start();
  } catch (error) {
    console.error('Failed to start uIOhook (check accessibility permissions):', error);
  }

  // WPM Calculation Loop
  setInterval(() => {
    const now = Date.now();
    // Keep only keystrokes from the last 60 seconds
    keystrokesInLastMinute = keystrokesInLastMinute.filter(time => now - time <= 60000);
    
    // Standard WPM: (Total characters / 5) / 1 minute
    const currentWPM = Math.round(keystrokesInLastMinute.length / 5);

    // Update fastest WPM
    let fastestWPM = store.get('fastestWPM') as number;
    if (currentWPM > fastestWPM) {
      fastestWPM = currentWPM;
      store.set('fastestWPM', fastestWPM);
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('typing-stats', {
        currentWPM,
        fastestWPM,
        totalKeystrokes: keystrokesInLastMinute.length,
        timestamp: now
      });
    }
  }, WPM_INTERVAL);
}

// IPC Handlers
ipcMain.handle('get-historical-data', () => {
  return store.get('typingData');
});

ipcMain.on('save-historical-data', (_event, data) => {
  store.set('typingData', data);
});
