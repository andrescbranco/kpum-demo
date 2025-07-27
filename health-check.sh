#!/bin/bash

echo "🏥 KPUM Demo Health Check"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service
check_service() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "Checking $name... "
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check port
check_port() {
    local name=$1
    local port=$2
    
    echo -n "Checking $name port $port... "
    
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check Docker container
check_container() {
    local name=$1
    
    echo -n "Checking Docker container $name... "
    
    if docker ps --format "table {{.Names}}" | grep -q "$name"; then
        echo -e "${GREEN}✅ RUNNING${NC}"
        return 0
    else
        echo -e "${RED}❌ NOT RUNNING${NC}"
        return 1
    fi
}

# Initialize counters
total_checks=0
passed_checks=0

# Check Docker containers
echo ""
echo "🐳 Docker Containers:"
check_container "kpum-demo_postgres_1" && ((passed_checks++)) || true
((total_checks++))
check_container "kpum-demo_backend_1" && ((passed_checks++)) || true
((total_checks++))
check_container "kpum-demo_frontend_1" && ((passed_checks++)) || true
((total_checks++))

# Check ports
echo ""
echo "🔌 Port Availability:"
check_port "PostgreSQL" 5432 && ((passed_checks++)) || true
((total_checks++))
check_port "Backend API" 8000 && ((passed_checks++)) || true
((total_checks++))
check_port "Frontend" 3000 && ((passed_checks++)) || true
((total_checks++))

# Check services
echo ""
echo "🌐 Service Health:"
check_service "Backend API" "http://localhost:8000/api/status" && ((passed_checks++)) || true
((total_checks++))
check_service "Frontend" "http://localhost:3000" && ((passed_checks++)) || true
((total_checks++))
check_service "Frontend Health" "http://localhost:3000/health" && ((passed_checks++)) || true
((total_checks++))

# Check WebSocket connection
echo ""
echo "🔌 WebSocket Connection:"
echo -n "Checking WebSocket... "
if curl -s -f "http://localhost:8000/api/status" | grep -q "active_connections"; then
    echo -e "${GREEN}✅ OK${NC}"
    ((passed_checks++))
else
    echo -e "${YELLOW}⚠️  NO ACTIVE CONNECTIONS${NC}"
    ((passed_checks++))
fi
((total_checks++))

# Summary
echo ""
echo "📊 Health Check Summary:"
echo "========================"
echo -e "Total checks: $total_checks"
echo -e "Passed: ${GREEN}$passed_checks${NC}"
echo -e "Failed: ${RED}$((total_checks - passed_checks))${NC}"

if [ $passed_checks -eq $total_checks ]; then
    echo ""
    echo -e "${GREEN}🎉 All systems operational!${NC}"
    echo ""
    echo "📋 Service URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   API Status: http://localhost:8000/api/status"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Some services are not responding properly.${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check Docker containers: docker ps"
    echo "   2. View logs: docker-compose -f docker-compose.prod.yml logs"
    echo "   3. Restart services: docker-compose -f docker-compose.prod.yml restart"
    exit 1
fi 