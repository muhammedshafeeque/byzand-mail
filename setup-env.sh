#!/bin/bash

# Email Client Environment Setup Script
# This script helps configure the environment variables for the email service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

APP_DIR="/var/www/mail.byzand.online"
ENV_FILE="$APP_DIR/server/.env"

echo -e "${BLUE}📧 Email Client Environment Setup${NC}"
echo "=================================="

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}❌ Please don't run this script as root. Run as ubuntu user.${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Application directory not found: $APP_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found application directory: $APP_DIR${NC}"

# Backup existing .env file if it exists
if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  Backing up existing .env file...${NC}"
    cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create new .env file
echo -e "${BLUE}🔧 Creating environment configuration...${NC}"

cat > "$ENV_FILE" << 'EOF'
# Server Configuration
PORT=3003
NODE_ENV=production
HOST=localhost

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/email-client

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Server Configuration
# Choose one of the following configurations:

# Option 1: Gmail (recommended for testing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@emailclient.com

# Option 2: Outlook/Hotmail
# EMAIL_HOST=smtp-mail.outlook.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=your-email@outlook.com
# EMAIL_PASS=your-password
# EMAIL_FROM=noreply@emailclient.com

# Option 3: Custom SMTP Server
# EMAIL_HOST=your-smtp-server.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=your-email@your-domain.com
# EMAIL_PASS=your-email-password
# EMAIL_FROM=noreply@your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=info
EOF

echo -e "${GREEN}✓ Environment file created: $ENV_FILE${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: You need to edit the .env file with your actual email credentials:${NC}"
echo "   sudo nano $ENV_FILE"
echo ""
echo -e "${BLUE}📝 Configuration steps:${NC}"
echo "1. Edit the .env file with your email credentials"
echo "2. For Gmail: Use an App Password (not your regular password)"
echo "3. For Outlook: Use your regular password"
echo "4. For custom SMTP: Use your server's credentials"
echo ""
echo -e "${BLUE}🔄 After editing, restart the application:${NC}"
echo "   pm2 restart byzand-mail"
echo ""
echo -e "${BLUE}🧪 Test the email service:${NC}"
echo "   curl http://localhost:3003/mail-test"
echo ""
echo -e "${GREEN}✅ Setup complete! Edit the .env file and restart the application.${NC}"
