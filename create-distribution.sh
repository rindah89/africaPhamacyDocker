#!/bin/bash

# Create distribution package for Africa Pharmacy
# This script prepares a ready-to-run package for pharmacy deployment

set -e

echo "🏗️  Creating Africa Pharmacy Distribution Package..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check prerequisites
echo "Checking prerequisites..."

# Check if .next directory exists
if [ ! -d ".next" ]; then
    echo -e "${RED}Error: Application not built!${NC}"
    echo "Please run 'npm run build' first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}Error: Dependencies not installed!${NC}"
    echo "Please run 'npm install --legacy-peer-deps' first."
    exit 1
fi

# Create distribution directory
DIST_NAME="AfricaPharmacy-Distribution-$(date +%Y%m%d-%H%M%S)"
DIST_DIR="dist/$DIST_NAME"
rm -rf dist
mkdir -p $DIST_DIR

echo -e "${GREEN}✓ Prerequisites checked${NC}"
echo ""

# Copy application files
echo "Copying application files..."
cp -r .next $DIST_DIR/
cp -r public $DIST_DIR/
cp -r prisma $DIST_DIR/
cp package*.json $DIST_DIR/
cp next.config.js $DIST_DIR/
cp middleware.ts $DIST_DIR/ 2>/dev/null || true

# Copy environment files
cp .env.production $DIST_DIR/
cp .env.production $DIST_DIR/.env.local

# Copy Docker files
cp docker-compose-mongodb.yml $DIST_DIR/
cp mongodb.conf $DIST_DIR/ 2>/dev/null || true

# Copy launcher scripts
echo "Copying launcher scripts..."
cp AfricaPharmacy.bat $DIST_DIR/
cp AfricaPharmacy.command $DIST_DIR/
cp start-pharmacy*.sh $DIST_DIR/ 2>/dev/null || true
chmod +x $DIST_DIR/*.sh $DIST_DIR/*.command 2>/dev/null || true

# Copy documentation
echo "Copying documentation..."
cp DESKTOP_APP_GUIDE.md $DIST_DIR/
cp DEPLOYMENT.md $DIST_DIR/ 2>/dev/null || true
cp README.md $DIST_DIR/ 2>/dev/null || true

# Create minimal node_modules with production deps
echo "Installing production dependencies (this may take a few minutes)..."
cd $DIST_DIR
npm ci --production --legacy-peer-deps --silent
cd ../..

# Remove unnecessary files to reduce size
echo "Optimizing package size..."
find $DIST_DIR/node_modules -name "*.md" -type f -delete 2>/dev/null || true
find $DIST_DIR/node_modules -name "*.txt" -type f -delete 2>/dev/null || true
find $DIST_DIR/node_modules -name ".github" -type d -exec rm -rf {} + 2>/dev/null || true
find $DIST_DIR/node_modules -name "test" -type d -exec rm -rf {} + 2>/dev/null || true
find $DIST_DIR/node_modules -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true

# Create version info
cat > $DIST_DIR/VERSION.txt << EOF
Africa Pharmacy Management System
Version: 1.0.0
Build Date: $(date)
Node Version: $(node --version)
Distribution Package
EOF

# Create simplified README
cat > $DIST_DIR/README.txt << 'EOF'
AFRICA PHARMACY - QUICK START
=============================

TO RUN THE APPLICATION:

Windows Users:
1. Make sure Docker Desktop is installed and running
2. Double-click "AfricaPharmacy.bat"
3. Wait for browser to open automatically

Mac/Linux Users:
1. Make sure Docker Desktop is installed and running
2. Double-click "AfricaPharmacy.command" (Mac)
   OR run "./start-pharmacy.sh" (Linux)
3. Wait for browser to open automatically

LOGIN CREDENTIALS:
Email: admin@africapharmacy.com
Password: P@ssw0rd2025!

IMPORTANT: Change the admin password after first login!

For detailed instructions, see DESKTOP_APP_GUIDE.md

SUPPORT:
If you encounter any issues, check the troubleshooting
section in DESKTOP_APP_GUIDE.md

System Requirements:
- 8GB RAM (minimum)
- 10GB free disk space
- Windows 10/11, macOS 10.14+, or Linux
- Docker Desktop
EOF

# Create the archive
echo ""
echo "Creating distribution archive..."
cd dist
tar -czf "$DIST_NAME.tar.gz" "$DIST_NAME"
zip -rq "$DIST_NAME.zip" "$DIST_NAME"
cd ..

# Calculate sizes
TAR_SIZE=$(du -h "dist/$DIST_NAME.tar.gz" | cut -f1)
ZIP_SIZE=$(du -h "dist/$DIST_NAME.zip" | cut -f1)

# Success message
echo ""
echo -e "${GREEN}✅ Distribution package created successfully!${NC}"
echo ""
echo "📦 Package Details:"
echo "   Location: dist/"
echo "   Archives created:"
echo "   - $DIST_NAME.tar.gz ($TAR_SIZE)"
echo "   - $DIST_NAME.zip ($ZIP_SIZE)"
echo ""
echo "📋 Package includes:"
echo "   ✓ Pre-built application"
echo "   ✓ Production dependencies"
echo "   ✓ Database configuration"
echo "   ✓ Launcher scripts"
echo "   ✓ Documentation"
echo ""
echo "🚀 Next steps:"
echo "   1. Test the package on a clean machine"
echo "   2. Copy to USB drive or upload for distribution"
echo "   3. Provide to pharmacy with installation guide"
echo ""