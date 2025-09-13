# Africa Pharmacy Management System

A comprehensive pharmacy management solution designed for African pharmacies, featuring inventory management, point-of-sale, and reporting capabilities.

## 🚀 Quick Start for End Users

### For Windows Users
1. Extract the AfricaPharmacy folder to your desktop
2. Double-click `SETUP.bat`
3. A desktop icon will be created automatically
4. The application will start in your browser

### For Mac Users
1. Extract the AfricaPharmacy folder to Applications
2. Double-click `AfricaPharmacy.command`
3. The application will start in your browser

### Default Login
- **Email**: admin@africapharmacy.com
- **Password**: P@ssw0rd2025!

⚠️ **Important**: Change the admin password immediately after first login!

## 📋 System Requirements

- **Operating System**: Windows 10/11, macOS 10.14+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 10GB free space
- **Docker Desktop**: Required for database
- **Browser**: Chrome, Firefox, Safari, or Edge (latest version)

## 🛠️ Developer Setup

### Prerequisites
1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
3. **Git** - For version control

### Initial Setup
```bash
# Clone the repository
git clone [repository-url]
cd AfricaPharmacy

# Install dependencies
npm install --legacy-peer-deps

# Copy environment file
cp .env.production .env.local
```

### Database Setup
```bash
# Start MongoDB with Docker
docker-compose -f docker-compose-mongodb.yml up -d

# Push database schema
npx prisma db push

# Seed the database (first time only)
npx prisma db seed
```

### Development
```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

 │   docker compose exec africapharmacy-app npx prisma db seed                                                                                                                                             │
```

## 📦 Creating Distribution Package

### For Developers - Preparing for Deployment

1. **Build the application**:can 
```bash
npm run build
```

2. **Create distribution package**:
```bash
./create-distribution.sh
```

This creates a ready-to-deploy package in the `dist/` folder containing:
- Pre-built application (no build step needed)
- Production dependencies only
- Launcher scripts for all platforms
- Desktop icon installers
- Documentation

## 🖥️ Desktop Deployment

### Deployment Options

#### Option 1: One-Click Setup (Recommended)
The distribution package includes `SETUP.bat` which:
- Creates desktop shortcuts automatically
- Adds Start Menu entries
- Configures the system
- Starts the application

Users just need to:
1. Extract the zip file
2. Double-click `SETUP.bat`
3. Use the desktop icon for daily access

#### Option 2: Manual Installation
1. Extract to desired location
2. Run `INSTALL-DESKTOP-ICON.bat` to create shortcuts
3. Use `AfricaPharmacy.bat` to start

### What Gets Installed

- **Desktop Icon**: "Africa Pharmacy" shortcut
- **Start Menu**: Programs → Africa Pharmacy
- **Database**: MongoDB in Docker (isolated)
- **Application**: Runs on http://localhost:3000

## 🗄️ Database Management

### Using MongoDB in Docker
The system uses MongoDB running in Docker for:
- Data isolation and security
- Easy backup and restore
- Automatic startup
- No installation conflicts

### Database Commands
```bash
# Start database
docker-compose -f docker-compose-mongodb.yml up -d

# Stop database
docker-compose -f docker-compose-mongodb.yml down

# View database UI (if enabled)
# http://localhost:8081
```

### Backup & Restore

#### Creating a Backup
```bash
# Windows
docker exec africapharmacy-mongodb mongodump --archive=/tmp/backup.archive --gzip
docker cp africapharmacy-mongodb:/tmp/backup.archive ./backup-$(date +%Y%m%d).archive

# Mac/Linux
docker exec africapharmacy-mongodb mongodump --archive=/tmp/backup.archive --gzip
docker cp africapharmacy-mongodb:/tmp/backup.archive ./backup-$(date +%Y%m%d).archive
```

#### Restoring from Backup
```bash
docker cp backup.archive africapharmacy-mongodb:/tmp/backup.archive
docker exec africapharmacy-mongodb mongorestore --archive=/tmp/backup.archive --gzip --drop
```

## 🔧 Configuration

### Environment Variables
Key settings in `.env.local`:
```env
# Database
DATABASE_URL="mongodb://localhost:27017/africapharmacy?replicaSet=rs0&directConnection=true"

# Application
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# File Storage
NEXT_PUBLIC_USE_LOCAL_STORAGE=true
```

### Network Access
To allow other computers in the pharmacy to access:

1. Find server IP address:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`

2. Update `.env.local`:
```env
NEXTAUTH_URL=http://YOUR-IP:3000
NEXT_PUBLIC_BASE_URL=http://YOUR-IP:3000
```

3. Access from other computers: `http://YOUR-IP:3000`

## 🚀 Features

### Inventory Management
- Product catalog with categories
- Stock tracking and alerts
- Supplier management
- Batch tracking with expiry dates
- Barcode support

### Point of Sale (POS)
- Fast product search
- Shopping cart
- Receipt printing
- Multiple payment methods
- Customer management

### Reports & Analytics
- Sales reports
- Inventory reports
- Financial summaries
- Product movement tracking
- Low stock alerts

### User Management
- Role-based access control
- Multiple user accounts
- Activity tracking
- Secure authentication

## 🛡️ Security

### Best Practices
1. **Change default passwords** immediately
2. **Regular backups** - Daily recommended
3. **User accounts** - Create individual accounts for staff
4. **Access control** - Use role-based permissions
5. **Network security** - Use firewall if networked

### Security Checklist
- [ ] Changed admin password
- [ ] Created user accounts for all staff
- [ ] Configured backup schedule
- [ ] Restricted network access
- [ ] Enabled audit logging

## 🔍 Troubleshooting

### Application Won't Start
1. Ensure Docker Desktop is running
2. Check if ports 3000 and 27017 are available
3. Run `docker ps` to verify containers
4. Check logs: `docker-compose logs`

### Cannot Access Database
1. Verify MongoDB is running: `docker ps`
2. Check connection string in `.env.local`
3. Ensure replica set is initialized
4. Restart Docker containers

### Performance Issues
1. Allocate more RAM to Docker Desktop
2. Close unnecessary applications
3. Clear browser cache
4. Check available disk space

### Common Error Messages

**"Port 3000 already in use"**
- Another application is using the port
- Change port in `.env.local`: `PORT=3001`

**"Cannot connect to MongoDB"**
- Docker Desktop not running
- Start with: `docker-compose -f docker-compose-mongodb.yml up -d`

## 📚 Documentation

### For Users
- `DESKTOP_APP_GUIDE.md` - End user guide
- `DEPLOYMENT.md` - Deployment instructions

### For Developers
- `DEVELOPER_SETUP_GUIDE.md` - Development setup
- API documentation in `/docs`

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15, React, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MongoDB with replica set
- **Authentication**: NextAuth.js
- **File Storage**: Local storage / Cloudinary
- **Deployment**: Docker, Node.js

### Project Structure
```
AfricaPharmacy/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                 # Utility functions
├── prisma/             # Database schema and migrations
├── public/             # Static assets
├── docker-compose-mongodb.yml
├── AfricaPharmacy.bat  # Windows launcher
├── AfricaPharmacy.command # Mac launcher
├── SETUP.bat           # One-click installer
└── README.md           # This file
```

## 🤝 Support

### Getting Help
1. Check the troubleshooting section
2. Review logs in the terminal
3. Consult documentation
4. Contact support with:
   - Error messages
   - Steps to reproduce
   - System information

### Maintenance
- **Daily**: Backup data
- **Weekly**: Check for updates
- **Monthly**: Archive old transactions
- **Quarterly**: Review user access

## 📄 License

Proprietary software. All rights reserved.

## 🙏 Acknowledgments

Built with modern web technologies to serve the needs of African pharmacies.

---

For technical support or questions, please maintain:
- Application logs
- Error screenshots
- System specifications
- Steps that led to the issue
