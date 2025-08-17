#!/bin/bash

echo "🔧 Fixing Nginx configuration..."

# Backup current config
sudo cp /etc/nginx/sites-available/mail.byzand.online /etc/nginx/sites-available/mail.byzand.online.backup

# Create new config with API routes
sudo tee /etc/nginx/sites-available/mail.byzand.online > /dev/null <<'EOF'
server {
    server_name mail.byzand.online;

    # Show fallback if upstream is down
    error_page 502 503 504 =200 /offline.html;

    # Serve static fallback & index
    root /var/www/mail.byzand.online/html;
    index index.html;

    location = /offline.html { internal; }

    # API routes - proxy to backend
    location /api/ {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_intercept_errors on;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # All other routes - serve React app
    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_intercept_errors on;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/mail.byzand.online/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mail.byzand.online/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = mail.byzand.online) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name mail.byzand.online;
    return 404; # managed by Certbot
}
EOF

# Test and reload Nginx
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    echo "🎉 Nginx configuration updated successfully!"
else
    echo "❌ Nginx configuration is invalid"
    echo "🔄 Restoring backup..."
    sudo cp /etc/nginx/sites-available/mail.byzand.online.backup /etc/nginx/sites-available/mail.byzand.online
    exit 1
fi
