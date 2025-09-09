@echo off
REM Africa Pharmacy Startup Script for Windows
REM This script starts the pharmacy management system

echo ========================================
echo   AFRICA PHARMACY MANAGEMENT SYSTEM
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker daemon is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/5] Starting MongoDB database...
docker-compose -f docker-compose-mongodb.yml up -d

REM Wait for MongoDB to be ready
echo [2/5] Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo [3/5] Checking database connection...
docker-compose -f docker-compose-mongodb.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Database might not be ready yet. Continuing...
)

echo [4/5] Installing dependencies...
call npm install --legacy-peer-deps

echo [5/5] Starting Africa Pharmacy application...
echo.
echo The application will start at: http://localhost:3000
echo.
echo Login credentials:
echo   Email: admin@africapharmacy.com
echo   Password: P@ssw0rd2025!
echo.
echo Press Ctrl+C to stop the application
echo ========================================
echo.

REM Set production environment
set NODE_ENV=production

REM Copy production env if it doesn't exist
if not exist .env.local (
    copy .env.production .env.local
)

REM Start the application
npm run build && npm start