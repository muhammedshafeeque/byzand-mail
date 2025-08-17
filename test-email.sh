#!/bin/bash

# Email Service Test Script
# This script tests the email service configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Email Service Test${NC}"
echo "====================="

# Test 1: Check if PM2 process is running
echo -e "${BLUE}1. Checking PM2 process...${NC}"
if pm2 list | grep -q "byzand-mail.*online"; then
    echo -e "${GREEN}✓ PM2 process is running${NC}"
else
    echo -e "${RED}✗ PM2 process is not running${NC}"
    echo "   Run: pm2 start ecosystem.config.js"
    exit 1
fi

# Test 2: Check if server is responding
echo -e "${BLUE}2. Testing server response...${NC}"
if curl -f http://localhost:3003/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is responding${NC}"
else
    echo -e "${RED}✗ Server is not responding${NC}"
    echo "   Check PM2 logs: pm2 logs byzand-mail"
    exit 1
fi

# Test 3: Test mail service configuration
echo -e "${BLUE}3. Testing mail service configuration...${NC}"
MAIL_TEST=$(curl -s http://localhost:3003/mail-test)
echo "Response: $MAIL_TEST"

# Parse the JSON response
if echo "$MAIL_TEST" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Mail service test completed successfully${NC}"
    
    # Check connection status
    if echo "$MAIL_TEST" | grep -q '"connected":true'; then
        echo -e "${GREEN}✓ SMTP connection is working${NC}"
    else
        echo -e "${YELLOW}⚠️  SMTP connection failed - check your .env configuration${NC}"
        echo "   Current config:"
        echo "$MAIL_TEST" | grep -o '"config":{[^}]*}' | head -1
    fi
else
    echo -e "${RED}✗ Mail service test failed${NC}"
fi

# Test 4: Check environment variables
echo -e "${BLUE}4. Checking environment variables...${NC}"
ENV_FILE="/var/www/mail.byzand.online/server/.env"
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    
    # Check if email configuration is set
    if grep -q "EMAIL_HOST=" "$ENV_FILE" && ! grep -q "EMAIL_HOST=your-smtp-server.com" "$ENV_FILE"; then
        echo -e "${GREEN}✓ Email host is configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Email host not configured${NC}"
    fi
    
    if grep -q "EMAIL_USER=" "$ENV_FILE" && ! grep -q "EMAIL_USER=your-email@your-domain.com" "$ENV_FILE"; then
        echo -e "${GREEN}✓ Email user is configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Email user not configured${NC}"
    fi
else
    echo -e "${RED}✗ .env file not found${NC}"
    echo "   Run: ./setup-env.sh"
fi

echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. If SMTP connection failed, edit your .env file:"
echo "   sudo nano /var/www/mail.byzand.online/server/.env"
echo ""
echo "2. Restart the application after changes:"
echo "   pm2 restart byzand-mail"
echo ""
echo "3. Test again:"
echo "   ./test-email.sh"
