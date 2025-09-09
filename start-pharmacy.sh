#!/bin/bash
# Africa Pharmacy Startup Script for Mac/Linux
# This script starts the pharmacy management system

echo "========================================"
echo "  AFRICA PHARMACY MANAGEMENT SYSTEM"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed!${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed!${NC}"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}[1/5]${NC} Starting MongoDB database..."
docker-compose -f docker-compose-mongodb.yml up -d

# Wait for MongoDB to be ready
echo -e "${GREEN}[2/5]${NC} Waiting for database to be ready..."
sleep 10

echo -e "${GREEN}[3/5]${NC} Checking database connection..."
if docker-compose -f docker-compose-mongodb.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
    echo -e "${GREEN}✓${NC} Database is ready!"
else
    echo -e "${YELLOW}⚠${NC} Database might not be ready yet. Continuing..."
fi

echo -e "${GREEN}[4/5]${NC} Installing dependencies..."
npm install --legacy-peer-deps

# Copy production env if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.production .env.local
    echo -e "${GREEN}✓${NC} Created .env.local from .env.production"
fi

echo -e "${GREEN}[5/5]${NC} Building and starting Africa Pharmacy application..."
echo ""
echo "The application will start at: ${GREEN}http://localhost:3000${NC}"
echo ""
echo "${YELLOW}Login credentials:${NC}"
echo "  Email: admin@africapharmacy.com"
echo "  Password: P@ssw0rd2025!"
echo ""
echo "Press Ctrl+C to stop the application"
echo "========================================"
echo ""

# Set production environment
export NODE_ENV=production

# Build and start the application
npm run build && npm start