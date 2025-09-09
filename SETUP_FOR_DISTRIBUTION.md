#!/bin/bash

# Script to create distribution package for Africa Pharmacy
# Run this to prepare the application for deployment to pharmacies

set -e

echo "🏗️  Creating Africa Pharmacy Distribution Package..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create distribution directory
DIST_DIR="AfricaPharmacy-Distribution-$(date +%Y%m%d)"
rm -rf $DIST_DIR
mkdir -p $DIST_DIR

echo "📦 Copying application files..."

# Copy essential files
cp -r package.json package-lock.json $DIST_DIR/
cp -r prisma public app components lib actions config types $DIST_DIR/
cp -r next.config.js tsconfig.json tailwind.config.js postcss.config.js $DIST_DIR/
cp -r middleware.ts $DIST_DIR/ 2>/dev/null || true

# Copy .next build directory
if [ -d ".next" ]; then
    cp -r .next $DIST_DIR/
else
    echo -e "${YELLOW}Warning: .next directory not found. Run 'npm run build' first!${NC}"
    exit 1
fi

# Copy Docker files
cp docker-compose-mongodb.yml $DIST_DIR/
cp .env.production $DIST_DIR/
cp .env.production $DIST_DIR/.env.local

# Copy launcher scripts
cp AfricaPharmacy.bat $DIST_DIR/
cp AfricaPharmacy.command $DIST_DIR/
chmod +x $DIST_DIR/AfricaPharmacy.command

# Copy documentation
cp DESKTOP_APP_GUIDE.md $DIST_DIR/
cp DEPLOYMENT.md $DIST_DIR/

# Create node_modules with production dependencies only
echo "📦 Installing production dependencies..."
cd $DIST_DIR
npm ci --production --legacy-peer-deps
cd ..

# Create version file
echo "Africa Pharmacy v1.0.0" > $DIST_DIR/VERSION.txt
echo "Built on: $(date)" >> $DIST_DIR/VERSION.txt

# Create quick start guide
cat > $DIST_DIR/README.txt << 'EOF'
AFRICA PHARMACY - Quick Start Guide
===================================

TO START THE APPLICATION:

Windows:
  Double-click "AfricaPharmacy.bat"

Mac:
  Double-click "AfricaPharmacy.command"

LOGIN:
  Email: admin@africapharmacy.com
  Password: P@ssw0rd2025!

For detailed instructions, see DESKTOP_APP_GUIDE.md

Requirements:
- Windows 10/11, macOS 10.14+, or Linux
- 8GB RAM recommended
- 10GB free disk space
EOF

# Create zip file
echo "📦 Creating distribution archive..."
zip -r "${DIST_DIR}.zip" $DIST_DIR -x "*/node_modules/*" "*.log"

echo -e "${GREEN}✅ Distribution package created successfully!${NC}"
echo ""
echo "Package location: ${DIST_DIR}.zip"
echo "Size: $(du -h ${DIST_DIR}.zip | cut -f1)"
echo ""
echo "This package contains everything needed to run Africa Pharmacy."
echo "Simply extract and run the appropriate launcher script."