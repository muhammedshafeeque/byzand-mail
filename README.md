# 📧 Byzand Mail - Email Client

A modern, Gmail-like email client built with React, TypeScript, and Node.js, designed for the `@byzand.online` domain.

## 🌐 Live Demo

**Production URL:** https://mail.byzand.online

## ✨ Features

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Secure password hashing with bcrypt
- User profile management

### 📧 Email Management
- Send and receive emails
- Email composition with rich text support
- File attachments (up to 10MB)
- Reply and forward functionality
- Email threading and organization

### 📁 Folder Organization
- Inbox, Sent, Drafts, Spam, Trash, Archive
- Email labeling and starring
- Bulk email operations
- Search and filtering

### 🎨 Modern UI
- Gmail-like interface design
- Responsive design for all devices
- Dark/light theme support
- Real-time notifications

### 🔒 Security
- Rate limiting and DDoS protection
- CORS configuration
- Helmet.js security headers
- Input validation and sanitization

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Heroicons** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Bcryptjs** - Password hashing

### DevOps
- **PM2** - Process manager
- **Nginx** - Reverse proxy
- **Let's Encrypt** - SSL certificates
- **GitHub Actions** - CI/CD

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Nginx (for production)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/muhammedshafeeque/byzand-mail.git
   cd byzand-mail
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Environment setup**
   ```bash
   # Copy environment files
   cp server/env.example server/.env
   cp client/.env.example client/.env
   ```

4. **Configure environment variables**
   ```bash
   # Server (.env)
   NODE_ENV=development
   PORT=3003
   MONGODB_URI=mongodb://localhost:27017/byzand-mail
   JWT_SECRET=your-jwt-secret
   EMAIL_HOST=smtp.byzand.online
   EMAIL_USER=noreply@byzand.online
   EMAIL_PASS=your-email-password
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3003
   - Health Check: http://localhost:3003/health

## 🚀 Production Deployment

### Manual Deployment

1. **Run the deployment script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **Configure environment variables**
   ```bash
   sudo nano /var/www/mail.byzand.online/server/.env
   ```

3. **Update email settings for @byzand.online domain**
   ```bash
   EMAIL_HOST=smtp.byzand.online
   EMAIL_USER=noreply@byzand.online
   EMAIL_PASS=your-email-password
   EMAIL_FROM=noreply@byzand.online
   ```

### Automated Deployment (CI/CD)

1. **Set up GitHub Secrets**
   - `VPS_HOST` - Your VPS IP address
   - `VPS_USERNAME` - SSH username
   - `VPS_SSH_KEY` - SSH private key

2. **Push to main branch**
   ```bash
   git push origin main
   ```

3. **Monitor deployment**
   - Check GitHub Actions tab
   - Monitor PM2 logs: `pm2 logs byzand-mail`

## 📧 Email Configuration

### SMTP Setup for @byzand.online

Configure your email server settings in the production environment:

```bash
EMAIL_HOST=smtp.byzand.online
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@byzand.online
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@byzand.online
```

### DNS Records

Ensure these DNS records are configured for `byzand.online`:

```
# A Record
mail.byzand.online -> Your VPS IP

# MX Record
byzand.online -> mail.byzand.online

# SPF Record
byzand.online TXT "v=spf1 mx a:mail.byzand.online ~all"

# DKIM Record (if using DKIM)
mail._domainkey.byzand.online TXT "v=DKIM1; k=rsa; p=your-public-key"
```

## 🔧 Management Commands

### PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs byzand-mail

# Restart application
pm2 restart byzand-mail

# Stop application
pm2 stop byzand-mail

# Start application
pm2 start byzand-mail
```

### Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### MongoDB Commands
```bash
# Connect to MongoDB
mongosh

# Check database
use byzand-mail
show collections

# Backup database
mongodump --db byzand-mail --out /backup/

# Restore database
mongorestore --db byzand-mail /backup/byzand-mail/
```

## 📁 Project Structure

```
byzand-mail/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── dist/              # Production build
├── server/                # Node.js backend
│   ├── src/
│   │   ├── configs/       # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Express middleware
│   └── uploads/           # File uploads
├── .github/               # GitHub Actions
├── deploy.sh              # Deployment script
├── nginx.conf             # Nginx configuration
└── README.md              # This file
```

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS Protection**: Configured for production domains
- **Input Validation**: All inputs are validated and sanitized
- **Password Security**: Bcrypt hashing with configurable rounds
- **JWT Tokens**: Secure authentication with expiration
- **File Upload Security**: Type and size restrictions
- **Helmet.js**: Security headers protection

## 📊 Monitoring

### Health Check
```bash
curl https://mail.byzand.online/health
```

### Logs
```bash
# Application logs
pm2 logs byzand-mail

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Project Wiki](https://github.com/muhammedshafeeque/byzand-mail/wiki)
- **Issues**: [GitHub Issues](https://github.com/muhammedshafeeque/byzand-mail/issues)
- **Email**: support@byzand.online

## 🎯 Roadmap

- [ ] Email templates
- [ ] Calendar integration
- [ ] Mobile app
- [ ] Advanced search filters
- [ ] Email encryption
- [ ] Multi-language support
- [ ] Email scheduling
- [ ] Advanced analytics

---

**Built with ❤️ for the Byzand community**
