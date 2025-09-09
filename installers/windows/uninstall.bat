@echo off
title Africa Pharmacy - Uninstaller
color 0C

:: Africa Pharmacy Uninstaller

echo.
echo ====================================================
echo      AFRICA PHARMACY - UNINSTALLER
echo ====================================================
echo.

:: Confirm uninstall
set /p confirm="Are you sure you want to uninstall Africa Pharmacy? (Y/N): "
if /i "%confirm%" neq "Y" exit

echo.
echo Uninstalling Africa Pharmacy...

:: Stop any running instances
echo Stopping application...
taskkill /F /IM node.exe >nul 2>&1
docker stop africapharmacy-mongodb >nul 2>&1

:: Remove shortcuts
echo Removing shortcuts...
del "%USERPROFILE%\Desktop\Africa Pharmacy.lnk" >nul 2>&1
rmdir /S /Q "%ProgramData%\Microsoft\Windows\Start Menu\Programs\Africa Pharmacy" >nul 2>&1

:: Remove firewall rules
echo Removing firewall rules...
netsh advfirewall firewall delete rule name="Africa Pharmacy Web" >nul 2>&1
netsh advfirewall firewall delete rule name="Africa Pharmacy Database" >nul 2>&1

:: Remove from registry
echo Cleaning registry...
reg delete "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\AfricaPharmacy" /f >nul 2>&1

:: Ask about data
echo.
set /p keepdata="Do you want to keep your pharmacy data? (Y/N): "
if /i "%keepdata%" neq "Y" (
    echo Removing application data...
    docker volume rm africapharmacy_mongodb_data >nul 2>&1
    rmdir /S /Q "%USERPROFILE%\.africapharmacy" >nul 2>&1
)

:: Remove program files (this must be done last)
echo Removing program files...
cd /d "%ProgramFiles%"
rmdir /S /Q "AfricaPharmacy" >nul 2>&1

echo.
echo ====================================================
echo Africa Pharmacy has been uninstalled.
if /i "%keepdata%" equ "Y" echo Your data has been preserved.
echo ====================================================
echo.
pause