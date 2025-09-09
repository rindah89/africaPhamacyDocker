@echo off
title Africa Pharmacy - Management System
color 0A

:: Africa Pharmacy Desktop Launcher for Windows
:: This script starts the pharmacy management system

echo.
echo ================================================
echo            AFRICA PHARMACY
echo         Management System v1.0
echo ================================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This application requires administrator privileges.
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

:: Set working directory to script location
cd /d "%~dp0"

:: Check Node.js
echo Checking system requirements...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js is not installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if Docker is installed and running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Docker is not installed.
    echo The application will use MongoDB directly.
    echo.
    echo For better performance, install Docker Desktop:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo.
    echo Installing application dependencies...
    echo This may take a few minutes on first run...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Build application if needed
if not exist ".next" (
    echo.
    echo Building application...
    echo This may take a few minutes on first run...
    call npm run build
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Failed to build application
        pause
        exit /b 1
    )
)

:: Start MongoDB using Docker
echo.
echo Starting database...
docker ps >nul 2>&1
if %errorlevel% equ 0 (
    :: Docker is running, use it
    docker-compose -f docker-compose-mongodb.yml up -d >nul 2>&1
    echo Database started successfully!
) else (
    :: Docker not running, start MongoDB directly
    echo Starting MongoDB...
    if not exist "%USERPROFILE%\.africapharmacy\mongodb" (
        mkdir "%USERPROFILE%\.africapharmacy\mongodb"
    )
    start /B mongod --dbpath "%USERPROFILE%\.africapharmacy\mongodb" --port 27017 --replSet rs0 >nul 2>&1
    timeout /t 5 /nobreak >nul
    mongosh --eval "rs.initiate()" >nul 2>&1
)

:: Set environment variables
set NODE_ENV=production
set DATABASE_URL=mongodb://localhost:27017/africapharmacy?replicaSet=rs0^&directConnection=true
set NEXTAUTH_URL=http://localhost:3000
set NEXTAUTH_SECRET=d66b1af42b3efd477d99c8babb131ec89e37d6cfcc122314cea614c2fca03f52
set PORT=3000

:: Start the application
echo.
echo Starting Africa Pharmacy...
echo.
echo ================================================
echo Application will open in your browser at:
echo http://localhost:3000
echo.
echo Login credentials:
echo   Email: admin@africapharmacy.com
echo   Password: P@ssw0rd2025!
echo ================================================
echo.
echo Press Ctrl+C to stop the application
echo.

:: Open browser after a delay
start /min cmd /c "timeout /t 10 /nobreak >nul && start http://localhost:3000"

:: Start the application
npm start

:: Cleanup on exit
echo.
echo Shutting down Africa Pharmacy...
docker-compose -f docker-compose-mongodb.yml down >nul 2>&1
taskkill /IM mongod.exe /F >nul 2>&1
echo.
echo Thank you for using Africa Pharmacy!
pause