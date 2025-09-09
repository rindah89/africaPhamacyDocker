#!/bin/bash
# Africa Pharmacy Development Startup Script
# For development and testing

echo "========================================"
echo "  AFRICA PHARMACY - DEVELOPMENT MODE"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check dependencies
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed!${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed!${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not running!${NC}"
    exit 1
fi

echo -e "${GREEN}[1/4]${NC} Starting MongoDB database..."
docker-compose -f docker-compose-mongodb.yml up -d

echo -e "${GREEN}[2/4]${NC} Waiting for database..."
sleep 10

echo -e "${GREEN}[3/4]${NC} Installing dependencies..."
npm install --legacy-peer-deps

echo -e "${GREEN}[4/4]${NC} Starting development server..."
echo ""
echo "Application: ${GREEN}http://localhost:3000${NC}"
echo "Database UI: ${GREEN}http://localhost:8081${NC} (admin/admin123)"
echo ""
echo "${YELLOW}Admin Login:${NC}"
echo "  Email: admin@africapharmacy.com"
echo "  Password: P@ssw0rd2025!"
echo ""

# Set environment
export NODE_ENV=development
export DATABASE_URL="mongodb://localhost:27017/africapharmacy?replicaSet=rs0&directConnection=true"

# Start in development mode
npm run dev