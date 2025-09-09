# Africa Pharmacy Desktop Application Guide

## 🚀 Quick Start

### For Windows Users:
1. **Double-click** `AfricaPharmacy.bat`
2. If prompted, click "Yes" to run as administrator
3. Wait for the application to start (browser will open automatically)

### For Mac Users:
1. **Double-click** `AfricaPharmacy.command`
2. If prompted, enter your password to allow the app to run
3. Wait for the application to start (browser will open automatically)

### For Linux Users:
1. Open Terminal in the AfricaPharmacy folder
2. Run: `./start-pharmacy.sh`
3. Open browser to http://localhost:3000

## 📋 System Requirements

- **Operating System**: Windows 10/11, macOS 10.14+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 10GB free space
- **Browser**: Chrome, Firefox, Safari, or Edge (latest version)

## 🔑 Login Credentials

- **Email**: `admin@africapharmacy.com`
- **Password**: `P@ssw0rd2025!`

⚠️ **Important**: Change the admin password immediately after first login!

## 📦 First Time Setup

The first time you run the application, it will:
1. Install necessary components (3-5 minutes)
2. Build the application (2-3 minutes)
3. Start the database
4. Open your browser automatically

## 🖥️ Daily Use

### Starting the Application:
- **Windows**: Double-click `AfricaPharmacy.bat`
- **Mac**: Double-click `AfricaPharmacy.command`
- The browser will open automatically
- Wait for the login screen to appear

### Stopping the Application:
- Press `Ctrl+C` in the terminal window
- Or close the terminal window
- The application will shut down gracefully

## 🛠️ Troubleshooting

### Application Won't Start
1. **Check if port 3000 is in use**:
   - Close any other applications using port 3000
   - Or edit the `.env.local` file to change the port

2. **Reinstall dependencies**:
   - Delete the `node_modules` folder
   - Run the startup script again

### Database Connection Error
1. **Ensure MongoDB is running**:
   - The script should start it automatically
   - Check if Docker Desktop is running (if installed)

2. **Reset the database**:
   - Stop the application
   - Delete the `.africapharmacy` folder in your home directory
   - Start the application again

### Browser Shows "Cannot Connect"
1. Wait 30-60 seconds for the application to fully start
2. Manually open http://localhost:3000
3. Check the terminal window for error messages

## 💾 Backup & Restore

### Creating a Backup:
1. Stop the application
2. Copy the entire `.africapharmacy` folder from your home directory
3. Store it in a safe location

### Restoring from Backup:
1. Stop the application
2. Replace the `.africapharmacy` folder with your backup
3. Start the application

## 🔒 Security Tips

1. **Change default passwords** immediately
2. **Regular backups**: Weekly or daily
3. **User accounts**: Create individual accounts for each staff member
4. **Logout**: Always logout when done
5. **Updates**: Keep the system updated

## 📱 Network Access

To allow other computers in the pharmacy to access the system:

1. Find your computer's IP address:
   - Windows: Run `ipconfig` in Command Prompt
   - Mac/Linux: Run `ifconfig` in Terminal

2. On other computers, open browser to:
   - `http://YOUR-IP-ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`

3. Ensure firewall allows port 3000

## ⚡ Performance Tips

1. **Close unnecessary programs** while running Africa Pharmacy
2. **Use Chrome or Firefox** for best performance
3. **Regular maintenance**: Restart weekly
4. **Keep data clean**: Archive old records

## 🆘 Getting Help

### Error Messages:
1. Take a screenshot of the error
2. Check the terminal window for details
3. Restart the application

### Common Issues:

**"Port already in use"**
- Another application is using port 3000
- Close it or change the port in settings

**"Database connection failed"**
- MongoDB didn't start properly
- Restart the application

**"Page not loading"**
- Clear browser cache
- Try a different browser

## 📝 Quick Reference

### Keyboard Shortcuts:
- `Ctrl+R` / `Cmd+R`: Refresh page
- `Ctrl+P` / `Cmd+P`: Print
- `F11`: Full screen mode

### Important Locations:
- **Application**: Current folder
- **Database**: `~/.africapharmacy/mongodb`
- **Logs**: `~/.africapharmacy/logs`
- **Backups**: Create your own backup folder

### Default Ports:
- **Application**: 3000
- **Database**: 27017
- **Database Admin**: 8081 (if enabled)

## 🎯 Best Practices

1. **Daily**:
   - Start application at beginning of day
   - Logout during breaks
   - Backup at end of day

2. **Weekly**:
   - Full system backup
   - Check for updates
   - Review user access

3. **Monthly**:
   - Archive old transactions
   - Update product prices
   - Review system performance

---

For technical support, keep this information ready:
- Operating system and version
- Error messages (screenshots)
- What you were doing when the error occurred
- Terminal/Command window output