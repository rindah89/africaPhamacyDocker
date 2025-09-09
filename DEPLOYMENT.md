# Africa Pharmacy Deployment Guide

This guide explains how to deploy the Africa Pharmacy Management System on a desktop computer in a pharmacy setting.

## System Architecture

The system uses a hybrid approach:
- **Database (MongoDB)**: Runs in Docker for stability and isolation
- **Application (Next.js)**: Runs directly on the host for better performance and easier updates

## Prerequisites

1. **Operating System**: Windows 10/11, macOS, or Linux
2. **Docker Desktop**: https://www.docker.com/products/docker-desktop
3. **Node.js 18+**: https://nodejs.org/
4. **Minimum RAM**: 8GB (16GB recommended)
5. **Storage**: 20GB free space

## Quick Start

### For Windows:
```batch
# Double-click or run in Command Prompt:
start-pharmacy.bat
```

### For Mac/Linux:
```bash
# Run in Terminal:
./start-pharmacy.sh
```

## Detailed Installation Steps

### 1. Install Prerequisites

#### Windows:
1. Download and install Docker Desktop from https://www.docker.com/products/docker-desktop
2. Download and install Node.js LTS from https://nodejs.org/
3. Restart your computer

#### Mac:
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Install Node.js
brew install node
```

#### Linux (Ubuntu/Debian):
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone or Copy the Application

Place the Africa Pharmacy folder on the desktop or a location of your choice.

### 3. Configure the System

1. Copy `.env.production` to `.env.local`:
   ```bash
   cp .env.production .env.local
   ```

2. Edit `.env.local` to customize:
   - Change `NEXTAUTH_SECRET` to a new random value
   - Update database passwords if desired
   - Configure email settings if needed

### 4. Start the System

#### Development Mode (for testing):
```bash
./start-pharmacy-dev.sh
```

#### Production Mode:
```bash
./start-pharmacy.sh
```

### 5. Access the System

- **Application**: http://localhost:3000
- **Database Admin**: http://localhost:8081 (if enabled)

### 6. Default Login

- **Email**: admin@africapharmacy.com
- **Password**: P@ssw0rd2025!

**IMPORTANT**: Change the admin password immediately after first login!

## Daily Operations

### Starting the System
1. Ensure Docker Desktop is running
2. Double-click the startup script or run it from terminal
3. Wait for the system to start (usually 30-60 seconds)
4. Open browser to http://localhost:3000

### Stopping the System
1. Press `Ctrl+C` in the terminal window
2. Run `./stop-pharmacy.sh` to stop the database

### Backup and Restore

#### Backup Database:
```bash
# Create backup directory
mkdir -p backups

# Backup (replace DATE with current date)
docker-compose -f docker-compose-mongodb.yml exec -T mongodb mongodump --archive=/tmp/backup.archive --gzip
docker cp africapharmacy-mongodb:/tmp/backup.archive ./backups/backup-DATE.archive
```

#### Restore Database:
```bash
# Restore from backup
docker cp ./backups/backup-DATE.archive africapharmacy-mongodb:/tmp/backup.archive
docker-compose -f docker-compose-mongodb.yml exec -T mongodb mongorestore --archive=/tmp/backup.archive --gzip
```

## Troubleshooting

### Port Already in Use
If you get an error about port 3000 being in use:
1. Close any other applications using port 3000
2. Or change the port in `.env.local`: `PORT=3001`

### Database Connection Issues
1. Ensure Docker Desktop is running
2. Check if MongoDB container is running:
   ```bash
   docker ps
   ```
3. Restart the database:
   ```bash
   docker-compose -f docker-compose-mongodb.yml restart
   ```

### Application Won't Start
1. Delete `node_modules` folder and `.next` folder
2. Run `npm install --legacy-peer-deps`
3. Try starting again

### Performance Issues
1. Ensure you have enough RAM (check Docker Desktop settings)
2. Close unnecessary applications
3. Consider upgrading to an SSD if using HDD

## Security Recommendations

1. **Change Default Passwords**: 
   - Admin account password
   - Database passwords in `.env.local`
   - MongoDB Express password

2. **Firewall Settings**:
   - Block external access to ports 3000, 27017, and 8081
   - Only allow local network access if needed

3. **Regular Backups**:
   - Set up daily automatic backups
   - Store backups on external drive or cloud

4. **Updates**:
   - Keep Docker Desktop updated
   - Update Node.js when new LTS versions are available
   - Update the application when new versions are released

## Production Checklist

- [ ] Changed all default passwords
- [ ] Configured firewall rules
- [ ] Set up backup schedule
- [ ] Tested backup restoration
- [ ] Created user accounts for staff
- [ ] Configured printer settings
- [ ] Tested all critical features
- [ ] Documented local customizations
- [ ] Trained staff on system usage

## Support

For technical support:
- Check application logs in the terminal
- MongoDB logs: `docker-compose -f docker-compose-mongodb.yml logs mongodb`
- Create an issue on GitHub with error details

## Advanced Configuration

### Custom MongoDB Configuration
Edit `mongodb.conf` for advanced database settings.

### SSL/HTTPS Setup
For production, consider setting up HTTPS using nginx reverse proxy.

### Multi-User Network Access
To allow access from other computers in the pharmacy:
1. Update `NEXTAUTH_URL` in `.env.local` to use the server's IP
2. Configure firewall to allow local network access
3. Update client computers to access http://SERVER-IP:3000