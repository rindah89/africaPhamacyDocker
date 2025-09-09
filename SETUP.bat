@echo off
title Africa Pharmacy - Quick Setup
color 0A

:: One-click setup for Africa Pharmacy
:: This creates desktop icon and starts the app

cls
echo.
echo ================================================
echo      AFRICA PHARMACY - QUICK SETUP
echo ================================================
echo.
echo This will:
echo   1. Create a desktop shortcut
echo   2. Start Africa Pharmacy
echo.
pause

:: Create desktop shortcut using PowerShell (simpler approach)
echo Creating desktop shortcut...
powershell -Command ^
"$desktop = [Environment]::GetFolderPath('Desktop'); ^
$WshShell = New-Object -comObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut(\"$desktop\Africa Pharmacy.lnk\"); ^
$Shortcut.TargetPath = '%CD%\AfricaPharmacy.bat'; ^
$Shortcut.WorkingDirectory = '%CD%'; ^
$Shortcut.IconLocation = '%CD%\icon.ico'; ^
$Shortcut.Description = 'Africa Pharmacy Management System'; ^
$Shortcut.Save()"

:: Create Start Menu entry
echo Creating Start Menu entry...
powershell -Command ^
"$startMenu = [Environment]::GetFolderPath('Programs'); ^
New-Item -ItemType Directory -Force -Path \"$startMenu\Africa Pharmacy\" | Out-Null; ^
$WshShell = New-Object -comObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut(\"$startMenu\Africa Pharmacy\Africa Pharmacy.lnk\"); ^
$Shortcut.TargetPath = '%CD%\AfricaPharmacy.bat'; ^
$Shortcut.WorkingDirectory = '%CD%'; ^
$Shortcut.IconLocation = '%CD%\icon.ico'; ^
$Shortcut.Description = 'Africa Pharmacy Management System'; ^
$Shortcut.Save()"

echo.
echo ✅ Desktop shortcut created!
echo ✅ Start Menu entry created!
echo.
echo ================================================
echo.
echo Starting Africa Pharmacy...
echo.
timeout /t 3 /nobreak >nul

:: Start the application
call AfricaPharmacy.bat