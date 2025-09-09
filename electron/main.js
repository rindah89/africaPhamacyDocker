const { app, BrowserWindow, Menu, Tray, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

// Keep references to avoid garbage collection
let mainWindow;
let mongoProcess;
let nextProcess;
let tray;
let isQuitting = false;

// Configuration
const NEXT_PORT = 3000;
const MONGO_PORT = 27017;
const APP_NAME = 'Africa Pharmacy';

// Create the application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Backup Database',
          click: () => backupDatabase()
        },
        {
          label: 'Restore Database',
          click: () => restoreDatabase()
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'User Manual',
          click: () => {
            shell.openExternal('file://' + path.join(__dirname, '../docs/user-manual.pdf'));
          }
        },
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Africa Pharmacy',
              message: 'Africa Pharmacy Management System',
              detail: 'Version 1.0.0\n\nA comprehensive pharmacy management solution.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Create system tray
function createTray() {
  tray = new Tray(path.join(__dirname, '../public/icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip(APP_NAME);
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// Check if a port is available
function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Wait for service to be ready
async function waitForService(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch (e) {
      // Service not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

// Start MongoDB
async function startMongoDB() {
  return new Promise((resolve, reject) => {
    const mongoPath = path.join(__dirname, '../mongodb');
    const dataPath = path.join(app.getPath('userData'), 'mongodb-data');
    
    // Ensure data directory exists
    require('fs').mkdirSync(dataPath, { recursive: true });
    
    // Check if MongoDB is already running
    checkPort(MONGO_PORT).then(isAvailable => {
      if (!isAvailable) {
        console.log('MongoDB already running');
        resolve();
        return;
      }
      
      // Start MongoDB
      mongoProcess = spawn('mongod', [
        '--dbpath', dataPath,
        '--port', MONGO_PORT,
        '--replSet', 'rs0',
        '--bind_ip', 'localhost'
      ], {
        stdio: 'pipe',
        shell: true
      });
      
      mongoProcess.on('error', (err) => {
        console.error('Failed to start MongoDB:', err);
        reject(err);
      });
      
      // Wait for MongoDB to be ready
      setTimeout(() => {
        // Initialize replica set
        const initRs = spawn('mongosh', [
          '--eval', 'rs.initiate()'
        ], {
          stdio: 'pipe',
          shell: true
        });
        
        initRs.on('close', () => {
          resolve();
        });
      }, 5000);
    });
  });
}

// Start Next.js server
async function startNextServer() {
  return new Promise((resolve, reject) => {
    const appPath = path.join(__dirname, '..');
    
    // Set environment variables
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = `mongodb://localhost:${MONGO_PORT}/africapharmacy?replicaSet=rs0&directConnection=true`;
    
    // Check if Next.js is already running
    checkPort(NEXT_PORT).then(isAvailable => {
      if (!isAvailable) {
        console.log('Next.js already running');
        resolve();
        return;
      }
      
      // Start Next.js
      nextProcess = spawn('npm', ['start'], {
        cwd: appPath,
        env: process.env,
        stdio: 'pipe',
        shell: true
      });
      
      nextProcess.on('error', (err) => {
        console.error('Failed to start Next.js:', err);
        reject(err);
      });
      
      // Wait for Next.js to be ready
      waitForService(`http://localhost:${NEXT_PORT}`).then(() => {
        resolve();
      });
    });
  });
}

// Create the main window
function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    title: APP_NAME
  });

  // Create menu and tray
  createMenu();
  createTray();

  // Load the app
  mainWindow.loadURL(`http://localhost:${NEXT_PORT}`);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Show welcome message
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Welcome to Africa Pharmacy',
      message: 'The application is starting up...',
      detail: 'Please wait while we initialize the database and application.',
      buttons: ['OK']
    });
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Application Running',
        message: 'Africa Pharmacy is still running in the background.',
        detail: 'You can access it from the system tray.',
        buttons: ['OK']
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Backup database
async function backupDatabase() {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Database Backup',
    defaultPath: `africapharmacy-backup-${new Date().toISOString().split('T')[0]}.archive`,
    filters: [
      { name: 'Database Backup', extensions: ['archive'] }
    ]
  });

  if (!result.canceled) {
    const backupProcess = spawn('mongodump', [
      '--archive=' + result.filePath,
      '--gzip',
      '--db=africapharmacy'
    ], {
      stdio: 'pipe',
      shell: true
    });

    backupProcess.on('close', (code) => {
      if (code === 0) {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Backup Complete',
          message: 'Database backup completed successfully!',
          buttons: ['OK']
        });
      } else {
        dialog.showErrorBox('Backup Failed', 'Failed to backup the database.');
      }
    });
  }
}

// Restore database
async function restoreDatabase() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Database Backup',
    filters: [
      { name: 'Database Backup', extensions: ['archive'] }
    ],
    properties: ['openFile']
  });

  if (!result.canceled) {
    const confirm = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Confirm Restore',
      message: 'Are you sure you want to restore the database?',
      detail: 'This will replace all current data with the backup.',
      buttons: ['Cancel', 'Restore'],
      defaultId: 0
    });

    if (confirm.response === 1) {
      const restoreProcess = spawn('mongorestore', [
        '--archive=' + result.filePaths[0],
        '--gzip',
        '--drop'
      ], {
        stdio: 'pipe',
        shell: true
      });

      restoreProcess.on('close', (code) => {
        if (code === 0) {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Restore Complete',
            message: 'Database restored successfully!',
            detail: 'Please restart the application for changes to take effect.',
            buttons: ['OK']
          });
        } else {
          dialog.showErrorBox('Restore Failed', 'Failed to restore the database.');
        }
      });
    }
  }
}

// App event handlers
app.whenReady().then(async () => {
  try {
    // Show splash screen
    const splash = new BrowserWindow({
      width: 400,
      height: 300,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      webPreferences: {
        nodeIntegration: false
      }
    });
    
    splash.loadFile(path.join(__dirname, 'splash.html'));
    splash.center();
    
    // Start services
    await startMongoDB();
    await startNextServer();
    
    // Close splash and show main window
    splash.close();
    createWindow();
    
  } catch (error) {
    dialog.showErrorBox('Startup Error', 'Failed to start Africa Pharmacy: ' + error.message);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

app.on('before-quit', async () => {
  isQuitting = true;
  
  // Stop services
  if (nextProcess) {
    nextProcess.kill();
  }
  
  if (mongoProcess) {
    mongoProcess.kill();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Unexpected Error', error.message);
});