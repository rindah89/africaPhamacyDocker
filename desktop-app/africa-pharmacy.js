#!/usr/bin/env node

/**
 * Africa Pharmacy Desktop Application
 * All-in-one launcher that runs MongoDB and the web application
 */

const { spawn, exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const open = require('open');

// Configuration
const APP_NAME = 'Africa Pharmacy';
const APP_PORT = 3000;
const MONGO_PORT = 27017;
const DATA_DIR = path.join(require('os').homedir(), '.africapharmacy');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Process tracking
let mongoProcess = null;
let appProcess = null;
let isShuttingDown = false;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

// Print colored message
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Print banner
function printBanner() {
  console.clear();
  log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║         💊  AFRICA PHARMACY  💊               ║
║         Management System v1.0                ║
║                                               ║
╚═══════════════════════════════════════════════╝
`, 'bright');
}

// Check if port is available
async function isPortAvailable(port) {
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
async function waitForService(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch (e) {
      // Service not ready
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

// Check if command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Install MongoDB if not present
async function ensureMongoDB() {
  log('\n📦 Checking MongoDB installation...', 'blue');
  
  if (commandExists('mongod')) {
    log('✓ MongoDB is installed', 'green');
    return true;
  }

  log('⚠ MongoDB not found. Please install MongoDB:', 'yellow');
  log('\nFor Windows: Download from https://www.mongodb.com/try/download/community', 'yellow');
  log('For Mac: brew install mongodb-community', 'yellow');
  log('For Linux: sudo apt install mongodb or sudo yum install mongodb', 'yellow');
  
  return false;
}

// Start MongoDB
async function startMongoDB() {
  log('\n🗄️  Starting database...', 'blue');
  
  const dbPath = path.join(DATA_DIR, 'mongodb');
  const logPath = path.join(DATA_DIR, 'mongodb.log');
  
  // Create database directory
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  // Check if MongoDB is already running
  const portAvailable = await isPortAvailable(MONGO_PORT);
  if (!portAvailable) {
    log('✓ MongoDB is already running', 'green');
    return true;
  }

  // Start MongoDB
  mongoProcess = spawn('mongod', [
    '--dbpath', dbPath,
    '--port', MONGO_PORT,
    '--replSet', 'rs0',
    '--bind_ip', 'localhost',
    '--logpath', logPath,
    '--fork'
  ], {
    stdio: 'pipe'
  });

  // Wait for MongoDB to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Initialize replica set
  try {
    execSync(`mongosh --port ${MONGO_PORT} --eval "rs.initiate()"`, { stdio: 'ignore' });
  } catch (e) {
    // Replica set might already be initialized
  }

  log('✓ Database started successfully', 'green');
  return true;
}

// Start the application
async function startApplication() {
  log('\n🚀 Starting application server...', 'blue');
  
  const appDir = path.join(__dirname, '..');
  
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

  // Check if application is built
  const nextDir = path.join(appDir, '.next');
  if (!fs.existsSync(nextDir)) {
    log('Building application (this may take a few minutes)...', 'yellow');
    try {
      execSync('npm run build', { cwd: appDir, stdio: 'inherit' });
    } catch (e) {
      log('❌ Build failed', 'red');
      return false;
    }
  }

  // Start the server
  appProcess = spawn('npm', ['start'], {
    cwd: appDir,
    env: env,
    stdio: 'pipe'
  });

  appProcess.stdout.on('data', (data) => {
    const message = data.toString().trim();
    if (message) console.log(`  ${message}`);
  });

  appProcess.stderr.on('data', (data) => {
    const message = data.toString().trim();
    if (message) console.error(`  ${colors.red}${message}${colors.reset}`);
  });

  // Wait for server to be ready
  log('Waiting for server to start...', 'yellow');
  const isReady = await waitForService(`http://localhost:${APP_PORT}`);
  
  if (isReady) {
    log('✓ Application server started successfully', 'green');
    return true;
  } else {
    log('❌ Failed to start application server', 'red');
    return false;
  }
}

// Open browser
async function openBrowser() {
  log('\n🌐 Opening browser...', 'blue');
  
  const url = `http://localhost:${APP_PORT}`;
  await open(url);
  
  log('✓ Browser opened', 'green');
  log(`\n📍 Application URL: ${colors.bright}${url}${colors.reset}`);
  log('\n👤 Default Login:', 'yellow');
  log('   Email: admin@africapharmacy.com');
  log('   Password: P@ssw0rd2025!');
}

// Shutdown handler
function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  log('\n\n🛑 Shutting down Africa Pharmacy...', 'yellow');
  
  // Stop application
  if (appProcess && !appProcess.killed) {
    appProcess.kill();
    log('✓ Application stopped', 'green');
  }
  
  // Stop MongoDB
  try {
    execSync(`mongosh --port ${MONGO_PORT} --eval "db.adminCommand({shutdown: 1})"`, { stdio: 'ignore' });
    log('✓ Database stopped', 'green');
  } catch (e) {
    // MongoDB might already be stopped
  }
  
  log('\n👋 Thank you for using Africa Pharmacy!', 'bright');
  process.exit(0);
}

// Main function
async function main() {
  printBanner();
  
  // Setup shutdown handlers
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('exit', shutdown);
  
  try {
    // Check prerequisites
    if (!await ensureMongoDB()) {
      log('\n❌ Please install MongoDB and try again', 'red');
      process.exit(1);
    }
    
    // Start services
    if (!await startMongoDB()) {
      throw new Error('Failed to start database');
    }
    
    if (!await startApplication()) {
      throw new Error('Failed to start application');
    }
    
    // Open browser
    await openBrowser();
    
    // Keep running
    log('\n✅ Africa Pharmacy is running!', 'green');
    log('\nPress Ctrl+C to stop the application', 'yellow');
    log('\n' + '─'.repeat(50), 'bright');
    
    // Keep the process alive
    process.stdin.resume();
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    shutdown();
  }
}

// Check if running as main module
if (require.main === module) {
  main();
}

module.exports = { main };