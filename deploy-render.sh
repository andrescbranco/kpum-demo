#!/bin/bash

echo "🌊 Render Deployment Script for KPUM Demo"
echo "========================================="

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found. Please ensure it exists in the project root."
    exit 1
fi

echo "✅ Found render.yaml configuration"

# Generate secure environment variables
echo "🔐 Generating secure environment variables..."

SECRET_KEY=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -base64 32)

echo "Generated Secret Key: $SECRET_KEY"
echo "Generated DB Password: $DB_PASSWORD"

echo ""
echo "🚀 Ready to deploy to Render!"
echo ""
echo "📋 Next steps:"
echo "1. Visit https://render.com"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New' → 'Web Service'"
echo "4. Connect your GitHub repository"
echo "5. Select this repository"
echo "6. Choose 'Docker' as environment"
echo "7. Set the following environment variables in Render dashboard:"
echo ""
echo "   SECRET_KEY=$SECRET_KEY"
echo "   POSTGRES_PASSWORD=$DB_PASSWORD"
echo "   POSTGRES_USER=kpum_user"
echo ""
echo "8. Click 'Create Web Service'"
echo "9. Wait for deployment to complete"
echo ""
echo "🔍 Monitor deployment in Render dashboard"
echo ""
echo "🌐 Your app will be available at:"
echo "   https://your-app-name.onrender.com"
echo ""
echo "📖 For detailed instructions, see CLOUD_DEPLOYMENT.md" 