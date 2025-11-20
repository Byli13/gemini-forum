#!/bin/bash

# Forum Application Startup Script

set -e

echo "================================"
echo "Forum Application Setup"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and change default passwords!"
    echo "   - POSTGRES_PASSWORD"
    echo "   - REDIS_PASSWORD"
    echo "   - JWT_SECRET"
    echo ""
    read -p "Press Enter to continue after updating .env file..."
else
    echo "✅ .env file exists"
fi

echo ""
echo "Building and starting containers..."
echo ""

# Stop any existing containers
docker-compose down 2>/dev/null || true

# Build and start containers
docker-compose up -d --build

echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "Checking service status..."
docker-compose ps

echo ""
echo "================================"
echo "✅ Forum Application is starting!"
echo "================================"
echo ""
echo "Access the application at:"
echo "  🌐 Main App: http://localhost:8080"
echo "  🔧 API:      http://localhost:8080/api"
echo "  💾 Backend:  http://localhost:3000"
echo ""
echo "Default admin credentials:"
echo "  Username: admin"
echo "  Password: Admin123!"
echo ""
echo "⚠️  Remember to change the admin password after first login!"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Stop services:    docker-compose down"
echo "  Restart services: docker-compose restart"
echo ""
