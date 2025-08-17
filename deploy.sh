#!/bin/bash

# Byzand Mail Deployment Script
# This script deploys the email client to production

set -e

echo "🚀 Starting Byzand Mail deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="byzand-mail"
APP_DIR="/var/www/mail.byzand.online"
BACKUP_DIR="/var/www/backups"
LOG_FILE="/var/log/byzand-mail-deploy.log"

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p $APP_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p /var/log

# Backup existing installation
if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
    echo "💾 Creating backup..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    sudo cp -r $APP_DIR $BACKUP_DIR/$BACKUP_NAME
    echo -e "${GREEN}✓ Backup created: $BACKUP_DIR/$BACKUP_NAME${NC}"
fi

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Install MongoDB if not installed
if ! command -v mongod &> /dev/null; then
    echo "📦 Installing MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl enable mongod
    sudo systemctl start mongod
fi

# Copy application files
echo "📋 Copying application files..."
sudo cp -r . $APP_DIR/
sudo chown -R $USER:$USER $APP_DIR

# Install dependencies
echo "📦 Installing dependencies..."
cd $APP_DIR

# Install root dependencies
if [ -f "package.json" ]; then
    npm install
fi

# Install client dependencies
if [ -d "client" ]; then
    echo "📦 Installing client dependencies..."
    cd client
    npm install
    npm run build
    cd ..
fi

# Install server dependencies
if [ -d "server" ]; then
    echo "📦 Installing server dependencies..."
    cd server
    npm install
    cd ..
fi

# Create production environment file
echo "⚙️ Creating production environment..."
sudo tee $APP_DIR/server/.env > /dev/null <<EOF
NODE_ENV=production
PORT=3003
MONGODB_URI=mongodb://localhost:27017/byzand-mail
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.byzand.online
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@byzand.online
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@byzand.online
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
EOF

# Create uploads directory
sudo mkdir -p $APP_DIR/server/uploads
sudo mkdir -p $APP_DIR/server/src/uploads
sudo chown -R $USER:$USER $APP_DIR/server/uploads

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 configuration..."
sudo tee $APP_DIR/ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [{
    name: 'byzand-mail',
    script: 'server/index.js',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3003
    },
    error_file: '/var/log/byzand-mail-error.log',
    out_file: '/var/log/byzand-mail-out.log',
    log_file: '/var/log/byzand-mail-combined.log',
    time: true
  }]
};
EOF

# Build the application
echo "🔨 Building application..."
cd $APP_DIR
if [ -d "server" ]; then
    cd server
    npm run build
    cd ..
fi

# Start/restart the application with PM2
echo "🚀 Starting application with PM2..."
pm2 delete byzand-mail 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Test the application
echo "🧪 Testing application..."
sleep 5
if curl -f http://localhost:3003/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Application is running successfully!${NC}"
else
    echo -e "${RED}✗ Application failed to start${NC}"
    pm2 logs byzand-mail --lines 20
    exit 1
fi

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}📧 Your email client is now available at: https://mail.byzand.online${NC}"
echo -e "${YELLOW}📊 PM2 Status: pm2 status${NC}"
echo -e "${YELLOW}📋 PM2 Logs: pm2 logs byzand-mail${NC}"
echo -e "${YELLOW}🔄 Restart: pm2 restart byzand-mail${NC}"
