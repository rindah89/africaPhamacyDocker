#!/bin/bash

# Create macOS Application Bundle for Africa Pharmacy

set -e

echo "Creating Africa Pharmacy.app..."

# App bundle structure
APP_NAME="Africa Pharmacy"
BUNDLE_NAME="AfricaPharmacy"
APP_DIR="${APP_NAME}.app"
CONTENTS_DIR="${APP_DIR}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"

# Clean previous build
rm -rf "$APP_DIR"

# Create directory structure
mkdir -p "$MACOS_DIR"
mkdir -p "$RESOURCES_DIR"

# Create Info.plist
cat > "${CONTENTS_DIR}/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>AfricaPharmacy</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.africapharmacy.app</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>Africa Pharmacy</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.14</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSSupportsAutomaticGraphicsSwitching</key>
    <true/>
</dict>
</plist>
EOF

# Create the executable script
cat > "${MACOS_DIR}/AfricaPharmacy" << 'EOF'
#!/bin/bash

# Get the directory where this app bundle is located
APP_BUNDLE_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)/AfricaPharmacy"

# Check if running from app bundle or development
if [[ "$APP_BUNDLE_PATH" == *.app ]]; then
    # Running from app bundle - use the installation directory
    APP_DIR="/Applications/AfricaPharmacy"
fi

# Change to app directory
cd "$APP_DIR"

# Check if Terminal should be used
if [[ "$1" == "--terminal" ]]; then
    # Run in Terminal
    osascript <<EOD
    tell application "Terminal"
        activate
        do script "cd '$APP_DIR' && ./AfricaPharmacy.command"
    end tell
EOD
else
    # Run directly (requires Terminal for output)
    open -a Terminal "$APP_DIR/AfricaPharmacy.command"
fi
EOF

# Make executable
chmod +x "${MACOS_DIR}/AfricaPharmacy"

# Copy icon (create a simple one for now)
# In production, you would use a proper .icns file
cp "../../icon.png" "${RESOURCES_DIR}/AppIcon.png" 2>/dev/null || {
    # Create a placeholder icon using sips if icon doesn't exist
    echo "Creating placeholder icon..."
    cat > "${RESOURCES_DIR}/icon.svg" << 'ICON'
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="#4CAF50"/>
  <text x="128" y="140" font-family="Arial" font-size="100" text-anchor="middle" fill="white">💊</text>
</svg>
ICON
}

echo "✅ Africa Pharmacy.app created successfully!"
echo ""
echo "To install:"
echo "1. Copy 'Africa Pharmacy.app' to /Applications"
echo "2. Copy the 'AfricaPharmacy' folder to /Applications"
echo "3. Double-click 'Africa Pharmacy.app' to run"
echo ""
echo "To create a DMG installer, run: ./create-dmg.sh"