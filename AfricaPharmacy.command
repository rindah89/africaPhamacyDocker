#!/bin/bash

# Africa Pharmacy Desktop Launcher for macOS
# This script starts the pharmacy management system

# Enable error handling
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Clear screen and show banner
clear
echo -e "${BOLD}"
echo "================================================"
echo "           💊 AFRICA PHARMACY 💊"
echo "         Management System v1.0"
echo "================================================"
echo -e "${NC}"

# Change to script directory
cd "$(dirname "$0")"

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
echo -e "${BLUE}Checking system requirements...${NC}"
if ! command_exists node; then
    echo -e "${RED}ERROR: Node.js is not installed!${NC}"
    echo ""
    echo "Please install Node.js from:"
    echo "https://nodejs.org/"
    echo ""
    echo "Or using Homebrew: brew install node"
    exit 1
fi

# Check Docker (optional)
if command_exists docker; then
    USE_DOCKER=true
    if ! docker info >/dev/null 2>&1; then
        echo -e "${YELLOW}Docker is installed but not running.${NC}"
        echo "Starting Docker Desktop..."
        open -a Docker
        echo "Waiting for Docker to start..."
        while ! docker info >/dev/null 2>&1; do
            sleep 2
        done
    fi
else
    USE_DOCKER=false
    echo -e "${YELLOW}Docker not found. Will use MongoDB directly.${NC}"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo -e "${BLUE}Installing application dependencies...${NC}"
    echo "This may take a few minutes on first run..."
    npm install --legacy-peer-deps
fi

# Build application if needed
if [ ! -d ".next" ]; then
    echo ""
    echo -e "${BLUE}Building application...${NC}"
    echo "This may take a few minutes on first run..."
    npm run build
fi

# Start MongoDB
echo ""
echo -e "${BLUE}Starting database...${NC}"

if [ "$USE_DOCKER" = true ]; then
    # Use Docker
    docker-compose -f docker-compose-mongodb.yml up -d
    echo -e "${GREEN}✓ Database started successfully!${NC}"
else
    # Use MongoDB directly
    if ! command_exists mongod; then
        echo -e "${RED}ERROR: MongoDB is not installed!${NC}"
        echo ""
        echo "Please install MongoDB:"
        echo "brew install mongodb-community"
        exit 1
    fi
    
    # Create data directory
    mkdir -p "$HOME/.africapharmacy/mongodb"
    
    # Start MongoDB
    mongod --dbpath "$HOME/.africapharmacy/mongodb" --port 27017 --replSet rs0 --fork --logpath "$HOME/.africapharmacy/mongodb.log"
    sleep 5
    
    # Initialize replica set
    mongosh --eval "rs.initiate()" >/dev/null 2>&1 || true
    echo -e "${GREEN}✓ Database started successfully!${NC}"
fi

# Set environment variables
export NODE_ENV=production
export DATABASE_URL="mongodb://localhost:27017/africapharmacy?replicaSet=rs0&directConnection=true"
export NEXTAUTH_URL="http://localhost:3000"
export NEXTAUTH_SECRET="d66b1af42b3efd477d99c8babb131ec89e37d6cfcc122314cea614c2fca03f52"
export PORT=3000

# Function to open browser
open_browser() {
    sleep 8
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "http://localhost:3000"
    else
        xdg-open "http://localhost:3000"
    fi
}

# Start browser in background
open_browser &

# Show startup info
echo ""
echo -e "${GREEN}Starting Africa Pharmacy...${NC}"
echo ""
echo "================================================"
echo -e "Application URL: ${BOLD}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Login credentials:${NC}"
echo "  Email: admin@africapharmacy.com"
echo "  Password: P@ssw0rd2025!"
echo "================================================"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the application${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down Africa Pharmacy...${NC}"
    
    if [ "$USE_DOCKER" = true ]; then
        docker-compose -f docker-compose-mongodb.yml down
    else
        # Stop MongoDB
        mongosh --eval "db.adminCommand({shutdown: 1})" >/dev/null 2>&1 || true
    fi
    
    echo -e "${GREEN}✓ Application stopped${NC}"
    echo ""
    echo "Thank you for using Africa Pharmacy!"
    exit 0
}

# Set up cleanup on exit
trap cleanup EXIT INT TERM

# Start the application
npm start