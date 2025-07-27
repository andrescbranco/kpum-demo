#!/bin/bash

set -e

echo "🚀 Starting KPUM Demo Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file with default values..."
    cat > .env << EOF
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here

# Backend Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
EOF
    echo "⚠️  Please edit .env file with your production values before continuing."
    echo "   Press Enter to continue with default values, or Ctrl+C to edit .env first."
    read
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check database
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database health check failed"
    exit 1
fi

# Check backend
if curl -f http://localhost:8000/api/status > /dev/null 2>&1; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API health check failed"
    exit 1
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Database: localhost:5432"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.prod.yml down"
echo "   Restart services: docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "🔍 Monitoring:"
echo "   Backend status: curl http://localhost:8000/api/status"
echo "   Frontend health: curl http://localhost:3000/health"
echo "" 