@echo off
title Africa Pharmacy - Installer
color 0A

:: Africa Pharmacy Desktop Installer for Windows
:: This creates desktop shortcuts and Start Menu entries

echo.
echo ====================================================
echo         AFRICA PHARMACY - INSTALLER
echo ====================================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This installer needs to run as Administrator.
    echo.
    echo Right-click on install.bat and select "Run as administrator"
    pause
    exit /b 1
)

:: Set paths
set "APP_NAME=Africa Pharmacy"
set "INSTALL_DIR=%ProgramFiles%\AfricaPharmacy"
set "DESKTOP=%USERPROFILE%\Desktop"
set "START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs"

echo Installing Africa Pharmacy...
echo.

:: Create installation directory
echo Creating application directory...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Copy application files
echo Copying application files...
xcopy /E /I /Y "..\..\*" "%INSTALL_DIR%" >nul 2>&1

:: Create desktop shortcut using PowerShell
echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\Africa Pharmacy.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\AfricaPharmacy.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\icon.ico'; $Shortcut.Description = 'Africa Pharmacy Management System'; $Shortcut.Save()"

:: Create Start Menu shortcut
echo Creating Start Menu entry...
if not exist "%START_MENU%\Africa Pharmacy" mkdir "%START_MENU%\Africa Pharmacy"
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%START_MENU%\Africa Pharmacy\Africa Pharmacy.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\AfricaPharmacy.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\icon.ico'; $Shortcut.Description = 'Africa Pharmacy Management System'; $Shortcut.Save()"

:: Create uninstaller shortcut
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%START_MENU%\Africa Pharmacy\Uninstall.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\uninstall.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\icon.ico'; $Shortcut.Description = 'Uninstall Africa Pharmacy'; $Shortcut.Save()"

:: Create firewall rules for the application
echo Configuring Windows Firewall...
netsh advfirewall firewall add rule name="Africa Pharmacy Web" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
netsh advfirewall firewall add rule name="Africa Pharmacy Database" dir=in action=allow protocol=TCP localport=27017 >nul 2>&1

:: Register as installed program (for Add/Remove Programs)
echo Registering application...
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\AfricaPharmacy" /v "DisplayName" /t REG_SZ /d "Africa Pharmacy" /f >nul
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\AfricaPharmacy" /v "UninstallString" /t REG_SZ /d "%INSTALL_DIR%\uninstall.bat" /f >nul
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\AfricaPharmacy" /v "DisplayIcon" /t REG_SZ /d "%INSTALL_DIR%\icon.ico" /f >nul
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\AfricaPharmacy" /v "Publisher" /t REG_SZ /d "Africa Pharmacy Ltd" /f >nul
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\AfricaPharmacy" /v "DisplayVersion" /t REG_SZ /d "1.0.0" /f >nul

echo.
echo ====================================================
echo         INSTALLATION COMPLETE!
echo ====================================================
echo.
echo Africa Pharmacy has been installed successfully!
echo.
echo Desktop shortcut created: "Africa Pharmacy"
echo Start Menu entry created: Start - All Programs - Africa Pharmacy
echo.
echo To start the application:
echo   - Double-click the "Africa Pharmacy" icon on your desktop
echo   - Or find it in the Start Menu
echo.
echo Default Login:
echo   Email: admin@africapharmacy.com
echo   Password: P@ssw0rd2025!
echo.
pause