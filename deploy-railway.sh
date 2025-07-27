#!/bin/bash

echo "🚂 Railway Deployment Script for KPUM Demo"
echo "=========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed."
    echo "📥 Installing Railway CLI..."
    
    # Install Railway CLI
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install railway
    else
        # Linux
        curl -fsSL https://railway.app/install.sh | sh
    fi
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway..."
    railway login
fi

# Generate secure environment variables
echo "🔐 Generating secure environment variables..."

SECRET_KEY=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -base64 32)

echo "Generated Secret Key: $SECRET_KEY"
echo "Generated DB Password: $DB_PASSWORD"

# Create .env file for Railway
cat > .env.railway << EOF
# Database Configuration
POSTGRES_USER=kpum_user
POSTGRES_PASSWORD=$DB_PASSWORD

# Backend Configuration
SECRET_KEY=$SECRET_KEY
CORS_ORIGINS=*

# Frontend Configuration
REACT_APP_API_URL=https://your-app-name.railway.app
REACT_APP_WS_URL=wss://your-app-name.railway.app/ws
EOF

echo "📝 Created .env.railway file with secure variables"
echo "⚠️  Remember to update REACT_APP_API_URL and REACT_APP_WS_URL with your actual Railway URL"

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Visit https://railway.app to monitor deployment"
echo "2. Update environment variables in Railway dashboard:"
echo "   - REACT_APP_API_URL: https://your-app-name.railway.app"
echo "   - REACT_APP_WS_URL: wss://your-app-name.railway.app/ws"
echo "3. Wait for deployment to complete"
echo "4. Share your Railway URL with others!"
echo ""
echo "🔍 Monitor deployment:"
echo "   railway logs"
echo ""
echo "🌐 Your app will be available at:"
echo "   https://your-app-name.railway.app" 