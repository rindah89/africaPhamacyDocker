# Developer Setup Guide for Africa Pharmacy Distribution

This guide explains how to prepare the Africa Pharmacy application for distribution to non-technical users.

## 📋 Prerequisites for Development Machine

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
3. **Git** - For version control
4. **MongoDB** (optional) - If not using Docker

## 🚀 Step-by-Step Setup Process

### Step 1: Initial Setup
```bash
# Clone or download the repository
git clone [repository-url]
cd AfricaPharmacy

# Install all dependencies
npm install --legacy-peer-deps
```

### Step 2: Configure Environment
```bash
# Copy production environment template
cp .env.production .env.local

# Edit .env.local if needed (usually not required)
```

### Step 3: Build the Application
```bash
# Build the Next.js application
npm run build

# This creates the .next directory with production-ready files
```

### Step 4: Test Locally
```bash
# Start MongoDB (using Docker)
docker-compose -f docker-compose-mongodb.yml up -d

# Seed the database (first time only)
npm run prisma:seed

# Test the application
npm start

# Open http://localhost:3000 to verify it works
```

### Step 5: Create Distribution Package
```bash
# Make the script executable
chmod +x create-distribution.sh

# Run the distribution script
./create-distribution.sh

# This creates AfricaPharmacy-Distribution-[DATE].zip
```

## 📦 What's in the Distribution Package

The distribution package includes:
- ✅ Pre-built application (no build step needed)
- ✅ Production dependencies only
- ✅ Launcher scripts for Windows/Mac
- ✅ Docker configuration for database
- ✅ User documentation
- ✅ Default environment configuration

## 🏪 Deployment at Pharmacy

### Option 1: Using Docker (Recommended)
**Prerequisites at pharmacy:**
- Docker Desktop installed
- 8GB RAM minimum

**Setup:**
1. Extract the distribution zip
2. Double-click the launcher (AfricaPharmacy.bat or .command)
3. Everything starts automatically

### Option 2: Without Docker
**Prerequisites at pharmacy:**
- MongoDB installed locally
- Node.js installed
- 8GB RAM minimum

**Setup:**
1. Extract the distribution zip
2. Install MongoDB manually
3. Run the launcher script

## 🔧 Customization Before Distribution

### 1. Change Default Passwords
Edit `.env.local` in the distribution:
```
NEXTAUTH_SECRET=generate-new-secret-here
MONGO_ROOT_PASSWORD=new-secure-password
```

### 2. Configure for Network Access
If multiple computers need access:
```
NEXTAUTH_URL=http://SERVER-IP:3000
NEXT_PUBLIC_BASE_URL=http://SERVER-IP:3000
```

### 3. Pre-seed Custom Data
Before distribution, you can:
1. Add pharmacy-specific products
2. Create additional user accounts
3. Configure tax rates and settings

## 📝 Pre-Distribution Checklist

- [ ] Application builds successfully (`npm run build`)
- [ ] Database starts and connects properly
- [ ] Admin login works (admin@africapharmacy.com)
- [ ] All main features tested:
  - [ ] Product management
  - [ ] Sales/POS
  - [ ] Inventory
  - [ ] Reports
- [ ] Launcher scripts work on target OS
- [ ] Documentation is included and accurate
- [ ] Version number updated in package.json

## 🚚 Distribution Methods

### 1. USB Drive
- Copy the zip file to USB drives
- Include printed quick start guide
- Test on target hardware first

### 2. Download Link
- Upload to secure file sharing service
- Provide download instructions
- Include license key if needed

### 3. Physical Installation
- Bring laptop with files
- Install directly on pharmacy computers
- Provide hands-on training

## ⚠️ Important Security Notes

1. **Change ALL default passwords** before distribution
2. **Generate new secrets** for production
3. **Disable MongoDB Express** in production (comment out in docker-compose)
4. **Use HTTPS** if accessible over network
5. **Regular backups** - train staff on backup procedures

## 🛠️ Troubleshooting Distribution Issues

### Build Issues
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

### Database Issues
```bash
# Reset Docker
docker-compose -f docker-compose-mongodb.yml down -v
docker-compose -f docker-compose-mongodb.yml up -d
```

### Permission Issues (Mac/Linux)
```bash
chmod +x AfricaPharmacy.command
chmod +x create-distribution.sh
```

## 📊 Minimum System Requirements for Pharmacies

**Hardware:**
- CPU: Dual-core 2GHz or better
- RAM: 8GB (16GB recommended)
- Storage: 20GB free space
- Display: 1366x768 or higher

**Software:**
- OS: Windows 10/11, macOS 10.14+, Ubuntu 18.04+
- Browser: Chrome, Firefox, Safari (latest)
- Docker Desktop (recommended)
- Internet: Not required (runs locally)

## 🎯 Final Steps

1. **Test the distribution package** on a clean machine
2. **Create backup** of the distribution package
3. **Prepare training materials** for pharmacy staff
4. **Schedule installation** at pharmacy
5. **Plan for ongoing support**

---

## Quick Commands Reference

```bash
# Development
npm install --legacy-peer-deps    # Install dependencies
npm run dev                       # Development mode
npm run build                     # Build for production
npm start                         # Start production server

# Database
docker-compose -f docker-compose-mongodb.yml up -d    # Start database
docker-compose -f docker-compose-mongodb.yml down     # Stop database
npm run prisma:seed              # Seed database

# Distribution
./create-distribution.sh         # Create distribution package
```