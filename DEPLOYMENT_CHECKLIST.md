# 🚀 KPUM Demo - Deployment Checklist

## ✅ Pre-Deployment Verification

### System Requirements
- [ ] Docker and Docker Compose installed
- [ ] At least 4GB RAM available
- [ ] Ports 3000, 8000, and 5432 available
- [ ] Git repository cloned locally

### Files Verification
- [ ] `docker-compose.prod.yml` - Production Docker Compose
- [ ] `deploy.sh` - Automated deployment script
- [ ] `health-check.sh` - Health monitoring script
- [ ] `DEPLOYMENT.md` - Detailed deployment guide
- [ ] `backend/Dockerfile.prod` - Production backend image
- [ ] `frontend/Dockerfile.prod` - Production frontend image
- [ ] `frontend/nginx.conf` - Nginx configuration

## 🚀 Deployment Steps

### 1. Environment Setup
```bash
# Navigate to project directory
cd kpum-demo

# Review and edit environment variables (optional)
nano .env
```

### 2. Deploy System
```bash
# Run automated deployment
./deploy.sh
```

### 3. Verify Deployment
```bash
# Check system health
./health-check.sh

# Manual verification
curl http://localhost:8000/api/status
curl http://localhost:3000
```

## 📊 Expected Results

### Service URLs
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Status**: http://localhost:8000/api/status
- **Database**: localhost:5432

### Health Check Results
```
🏥 KPUM Demo Health Check
=========================

🐳 Docker Containers:
Checking Docker container kpum-demo_postgres_1... ✅ RUNNING
Checking Docker container kpum-demo_backend_1... ✅ RUNNING
Checking Docker container kpum-demo_frontend_1... ✅ RUNNING

🔌 Port Availability:
Checking PostgreSQL port 5432... ✅ OK
Checking Backend API port 8000... ✅ OK
Checking Frontend port 3000... ✅ OK

🌐 Service Health:
Checking Backend API... ✅ OK
Checking Frontend... ✅ OK
Checking Frontend Health... ✅ OK

🔌 WebSocket Connection:
Checking WebSocket... ✅ OK

📊 Health Check Summary:
========================
Total checks: 8
Passed: 8
Failed: 0

🎉 All systems operational!
```

## 🔧 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill processes using required ports
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
lsof -ti:5432 | xargs kill -9
```

**Docker Issues**
```bash
# Clean up Docker
docker system prune -f
docker volume prune -f

# Restart Docker Desktop
```

**Build Failures**
```bash
# Rebuild without cache
docker-compose -f docker-compose.prod.yml build --no-cache

# Check logs
docker-compose -f docker-compose.prod.yml logs
```

## 📈 Post-Deployment

### Monitoring
```bash
# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# Check resource usage
docker stats

# Monitor system health
watch -n 30 ./health-check.sh
```

### Maintenance
```bash
# Update system
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres kpum_demo > backup.sql
```

## 🎯 Success Criteria

- [ ] All Docker containers running
- [ ] All ports accessible
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend API responds at http://localhost:8000/api/status
- [ ] WebSocket connections active
- [ ] Patient data streaming in real-time
- [ ] Navigation bar functional
- [ ] Map component working
- [ ] Treatment and dispatch workflows functional

## 🚨 Emergency Procedures

### System Down
```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Complete restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Data Loss
```bash
# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres kpum_demo < backup.sql
```

### Complete Reset
```bash
# Remove all data and restart
docker-compose -f docker-compose.prod.yml down -v
docker system prune -f
./deploy.sh
```

---

**🎉 Ready for Deployment!**

Your KPUM Demo system is fully prepared for production deployment. Run `./deploy.sh` to get started! 