const { app, BrowserWindow, Menu, dialog, shell, Notification } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

// Configuration
const APP_NAME = 'Africa Pharmacy';
const APP_PORT = 3000;
const MONGO_PORT = 27017;

let mainWindow;
let splashWindow;
let serverProcess;
let mongoProcess;

// Platform-specific paths
const IS_WINDOWS = process.platform === 'win32';
const IS_MAC = process.platform === 'darwin';
const IS_LINUX = process.platform === 'linux';

// Get the app data directory
function getAppDataPath() {
  return app.getPath('userData');
}

// Check if port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, 'localhost');
  });
}

// Wait for service to be ready
async function waitForService(url, maxAttempts = 60) {
  console.log(`Waiting for service at ${url}...`);
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('Service is ready!');
        return true;
      }
    } catch (e) {
      // Service not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('Service failed to start');
  return false;
}

// Show notification
function showNotification(title, body) {
  new Notification({ title, body }).show();
}

// Create splash screen
function createSplashScreen() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const splashHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #1a1a1a;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          user-select: none;
        }
        .logo {
          font-size: 80px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 32px;
          margin: 0 0 10px 0;
          font-weight: 300;
        }
        .subtitle {
          font-size: 16px;
          color: #999;
          margin-bottom: 40px;
        }
        .status {
          font-size: 14px;
          color: #666;
          margin-top: 20px;
        }
        .loader {
          width: 200px;
          height: 4px;
          background: #333;
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }
        .loader-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 30%;
          background: #4CAF50;
          animation: loading 1.5s ease-in-out infinite;
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      </style>
    </head>
    <body>
      <div class="logo">💊</div>
      <h1>Africa Pharmacy</h1>
      <div class="subtitle">Management System</div>
      <div class="loader">
        <div class="loader-bar"></div>
      </div>
      <div class="status" id="status">Starting application...</div>
      <script>
        const { ipcRenderer } = require('electron');
        ipcRenderer.on('status', (event, message) => {
          document.getElementById('status').textContent = message;
        });
      </script>
    </body>
    </html>
  `;

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`);
  splashWindow.center();
}

// Update splash status
function updateSplashStatus(message) {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send('status', message);
  }
}

// Start embedded MongoDB
async function startMongoDB() {
  const dataPath = path.join(getAppDataPath(), 'mongodb-data');
  fs.mkdirSync(dataPath, { recursive: true });

  // Check if MongoDB is already running
  const portAvailable = await checkPort(MONGO_PORT);
  if (!portAvailable) {
    console.log('MongoDB already running');
    return true;
  }

  updateSplashStatus('Starting database...');

  // Use Docker to run MongoDB
  return new Promise((resolve) => {
    const dockerCommand = IS_WINDOWS ? 'docker.exe' : 'docker';
    
    // First, try to stop any existing container
    exec(`${dockerCommand} stop africapharmacy-mongodb`, () => {
      exec(`${dockerCommand} rm africapharmacy-mongodb`, () => {
        // Start new container
        mongoProcess = spawn(dockerCommand, [
          'run',
          '--name', 'africapharmacy-mongodb',
          '-p', `${MONGO_PORT}:27017`,
          '-v', `${dataPath}:/data/db`,
          '-d',
          'mongo:7.0',
          'mongod', '--replSet', 'rs0', '--bind_ip_all'
        ]);

        mongoProcess.on('error', (err) => {
          console.error('MongoDB start error:', err);
          resolve(false);
        });

        // Wait a bit for MongoDB to start
        setTimeout(() => {
          // Initialize replica set
          exec(`${dockerCommand} exec africapharmacy-mongodb mongosh --eval "rs.initiate()"`, (error) => {
            if (error) {
              console.log('Replica set might already be initialized');
            }
            resolve(true);
          });
        }, 5000);
      });
    });
  });
}

// Start the application server
async function startAppServer() {
  const appPath = app.getAppPath();
  
  updateSplashStatus('Building application...');

  // First build the app
  await new Promise((resolve) => {
    exec('npm run build', { cwd: appPath }, (error) => {
      if (error) console.error('Build error:', error);
      resolve();
    });
  });

  updateSplashStatus('Starting server...');

  // Set environment variables
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    DATABASE_URL: `mongodb://localhost:${MONGO_PORT}/africapharmacy?replicaSet=rs0&directConnection=true`,
    NEXTAUTH_URL: `http://localhost:${APP_PORT}`,
    NEXTAUTH_SECRET: 'd66b1af42b3efd477d99c8babb131ec89e37d6cfcc122314cea614c2fca03f52',
    PORT: APP_PORT,
    HOSTNAME: '0.0.0.0'
  };

  // Start the Next.js server
  serverProcess = spawn('npm', ['start'], {
    cwd: appPath,
    env: env,
    shell: true
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });

  // Wait for server to be ready
  const isReady = await waitForService(`http://localhost:${APP_PORT}`);
  return isReady;
}

// Create main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '../public/icon.png'),
    show: false,
    title: APP_NAME
  });

  // Create menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Refresh',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.reload()
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: IS_MAC ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Africa Pharmacy',
              message: APP_NAME,
              detail: `Version 1.0.0\n\nA comprehensive pharmacy management system.\n\nDefault Login:\nEmail: admin@africapharmacy.com\nPassword: P@ssw0rd2025!`,
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Load the app
  mainWindow.loadURL(`http://localhost:${APP_PORT}`);

  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      setTimeout(() => {
        splashWindow.close();
        mainWindow.show();
      }, 1000);
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App initialization
app.whenReady().then(async () => {
  createSplashScreen();
  
  try {
    // Check if Docker is available
    const dockerAvailable = await new Promise((resolve) => {
      exec('docker --version', (error) => {
        resolve(!error);
      });
    });

    if (!dockerAvailable) {
      dialog.showErrorBox(
        'Docker Not Found',
        'Docker Desktop is required to run Africa Pharmacy.\n\nPlease install Docker Desktop from:\nhttps://www.docker.com/products/docker-desktop'
      );
      app.quit();
      return;
    }

    // Start services
    const mongoStarted = await startMongoDB();
    if (!mongoStarted) {
      throw new Error('Failed to start database');
    }

    const serverStarted = await startAppServer();
    if (!serverStarted) {
      throw new Error('Failed to start application server');
    }

    // Create main window
    createMainWindow();
    
    showNotification('Africa Pharmacy', 'Application started successfully!');

  } catch (error) {
    dialog.showErrorBox('Startup Error', `Failed to start Africa Pharmacy:\n\n${error.message}`);
    app.quit();
  }
});

// App event handlers
app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  // Stop server
  if (serverProcess) {
    serverProcess.kill();
  }

  // Stop MongoDB
  if (IS_WINDOWS) {
    exec('docker.exe stop africapharmacy-mongodb');
  } else {
    exec('docker stop africapharmacy-mongodb');
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Unexpected Error', error.message);
});