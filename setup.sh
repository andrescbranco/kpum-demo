#!/bin/bash

echo "🏥 KPUM Demo Setup"
echo "=================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend environment file..."
    cp backend/env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend environment file..."
    cp frontend/env.example frontend/.env
fi

echo "🚀 Starting KPUM Demo services..."
echo "This may take a few minutes on first run..."

# Start the services
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ KPUM Demo is now running!"
    echo ""
    echo "🌐 Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo ""
    echo "📊 The system will automatically:"
    echo "   • Create 30 mock patients"
    echo "   • Start real-time vital signs simulation"
    echo "   • Stream data via WebSocket"
    echo "   • Allow treatment and dispatch decisions"
    echo ""
    echo "🛑 To stop the services, run:"
    echo "   docker-compose down"
    echo ""
    echo "📝 To view logs, run:"
    echo "   docker-compose logs -f"
else
    echo "❌ Failed to start services. Check the logs with:"
    echo "   docker-compose logs"
    exit 1
fi 