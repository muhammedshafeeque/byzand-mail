#!/bin/bash

echo "🔄 Restarting Byzand Mail Server..."

# Navigate to the application directory
cd /var/www/mail.byzand.online

# Stop any existing PM2 processes
echo "🛑 Stopping existing processes..."
pm2 delete byzand-mail 2>/dev/null || true
pm2 kill 2>/dev/null || true

# Wait a moment
sleep 2

# Start the server with PM2
echo "🚀 Starting server with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
echo "📊 PM2 Status:"
pm2 status

# Test the mail service
echo "🧪 Testing mail service..."
sleep 3
curl -s http://localhost:3003/mail-test | jq . 2>/dev/null || curl -s http://localhost:3003/mail-test

echo "✅ Server restart completed!"
