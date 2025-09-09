#!/usr/bin/env python3
"""
Cross-platform desktop shortcut creator for Africa Pharmacy
Works on Windows, macOS, and Linux
"""

import os
import sys
import platform
import subprocess
from pathlib import Path

def get_desktop_path():
    """Get the desktop path for the current OS"""
    system = platform.system()
    
    if system == "Windows":
        return Path.home() / "Desktop"
    elif system == "Darwin":  # macOS
        return Path.home() / "Desktop"
    else:  # Linux
        # Try to get from user-dirs.dirs
        try:
            config = Path.home() / ".config" / "user-dirs.dirs"
            if config.exists():
                with open(config) as f:
                    for line in f:
                        if line.startswith("XDG_DESKTOP_DIR"):
                            desktop = line.split("=")[1].strip().strip('"')
                            desktop = desktop.replace("$HOME", str(Path.home()))
                            return Path(desktop)
        except:
            pass
        return Path.home() / "Desktop"

def create_windows_shortcut():
    """Create Windows desktop shortcut"""
    desktop = get_desktop_path()
    app_dir = Path.cwd()
    
    # VBScript to create shortcut
    vbs_content = f'''
Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "{desktop}\\Africa Pharmacy.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "{app_dir}\\AfricaPharmacy.bat"
oLink.WorkingDirectory = "{app_dir}"
oLink.Description = "Africa Pharmacy Management System"
oLink.IconLocation = "{app_dir}\\icon.ico"
oLink.Save
    '''
    
    # Write and execute VBScript
    vbs_file = Path("temp_create_shortcut.vbs")
    vbs_file.write_text(vbs_content)
    subprocess.run(["cscript", "//nologo", str(vbs_file)], shell=True)
    vbs_file.unlink()
    
    print(f"✅ Desktop shortcut created: {desktop}\\Africa Pharmacy.lnk")

def create_macos_alias():
    """Create macOS desktop alias"""
    desktop = get_desktop_path()
    app_dir = Path.cwd()
    app_script = app_dir / "AfricaPharmacy.command"
    
    # Create alias using osascript
    script = f'''
    tell application "Finder"
        make alias file to POSIX file "{app_script}" at desktop
        set name of result to "Africa Pharmacy"
    end tell
    '''
    
    subprocess.run(["osascript", "-e", script])
    print(f"✅ Desktop alias created: {desktop}/Africa Pharmacy")

def create_linux_desktop():
    """Create Linux desktop file"""
    desktop = get_desktop_path()
    app_dir = Path.cwd()
    
    desktop_content = f'''[Desktop Entry]
Version=1.0
Type=Application
Name=Africa Pharmacy
Comment=Pharmacy Management System
Exec={app_dir}/start-pharmacy.sh
Icon={app_dir}/icon.png
Path={app_dir}
Terminal=true
Categories=Office;Database;
'''
    
    desktop_file = desktop / "africa-pharmacy.desktop"
    desktop_file.write_text(desktop_content)
    desktop_file.chmod(0o755)
    
    print(f"✅ Desktop launcher created: {desktop_file}")

def create_icon_file():
    """Create a simple icon if it doesn't exist"""
    icon_path = Path.cwd() / "icon.png"
    
    if not icon_path.exists():
        # Create a simple icon using PIL if available
        try:
            from PIL import Image, ImageDraw, ImageFont
            
            # Create icon
            img = Image.new('RGB', (256, 256), color='#4CAF50')
            draw = ImageDraw.Draw(img)
            
            # Draw pharmacy symbol
            draw.text((90, 80), "💊", fill='white', font=None)
            
            img.save(icon_path)
            print("✅ Icon created: icon.png")
        except ImportError:
            print("ℹ️  Note: Install Pillow for icon generation: pip install Pillow")

def main():
    """Main function"""
    print("===========================================")
    print("   AFRICA PHARMACY - DESKTOP ICON CREATOR")
    print("===========================================")
    print()
    
    system = platform.system()
    print(f"Detected OS: {system}")
    print()
    
    # Create icon if needed
    create_icon_file()
    
    # Create desktop shortcut based on OS
    try:
        if system == "Windows":
            create_windows_shortcut()
        elif system == "Darwin":
            create_macos_alias()
        else:  # Linux
            create_linux_desktop()
            
        print()
        print("===========================================")
        print("Desktop icon created successfully!")
        print()
        print("You can now start Africa Pharmacy by")
        print("double-clicking the icon on your desktop.")
        print("===========================================")
        
    except Exception as e:
        print(f"❌ Error creating desktop icon: {e}")
        print()
        print("You can still run the application using:")
        if system == "Windows":
            print("  - AfricaPharmacy.bat")
        else:
            print("  - ./start-pharmacy.sh")

if __name__ == "__main__":
    main()
    input("\nPress Enter to continue...")