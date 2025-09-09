@echo off
title Africa Pharmacy - Desktop Icon Installer
color 0A

:: Simple desktop icon installer for Africa Pharmacy
cls
echo.
echo ============================================
echo     AFRICA PHARMACY - DESKTOP ICON
echo ============================================
echo.
echo This will create a desktop shortcut for
echo easy access to Africa Pharmacy.
echo.
pause

:: Run the VBScript to create shortcut
echo Creating desktop shortcut...
cscript //nologo installers\create-desktop-shortcut.vbs

echo.
echo ============================================
echo Installation complete!
echo.
echo You can now start Africa Pharmacy by
echo double-clicking the icon on your desktop.
echo ============================================
echo.
pause