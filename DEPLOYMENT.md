# 🚀 KPUM Demo Deployment Guide

This guide will help you deploy the KPUM (Knowledge Processing and Understanding Machines) demo system to production.

## 📋 Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 3000, 8000, and 5432 available

## 🏗️ Architecture

The system consists of three main components:

1. **Frontend** (React + TypeScript) - Port 3000
2. **Backend** (FastAPI + Python) - Port 8000  
3. **Database** (PostgreSQL) - Port 5432

## 🚀 Quick Deployment

### 1. Clone and Navigate
```bash
git clone <your-repo-url>
cd kpum-demo
```

### 2. Run Deployment Script
```bash
./deploy.sh
```

The script will:
- Check prerequisites
- Create environment file
- Build and start all services
- Verify health checks
- Display service URLs

## 🔧 Manual Deployment

### 1. Environment Configuration
Create a `.env` file in the root directory:

```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here

# Backend Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
```

### 2. Start Services
```bash
# Development
docker-compose up --build

# Production
docker-compose -f docker-compose.prod.yml up --build -d
```

### 3. Verify Deployment
```bash
# Check service status
curl http://localhost:8000/api/status
curl http://localhost:3000

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🌐 Production Deployment

### Environment Variables
For production, update the `.env` file with:

```bash
# Production Database
POSTGRES_USER=kpum_prod
POSTGRES_PASSWORD=very-secure-password-123

# Production Backend
SECRET_KEY=your-256-bit-secret-key-here
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Production Frontend
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WS_URL=wss://api.yourdomain.com/ws
```

### SSL/HTTPS Setup
1. Add SSL certificates to `./ssl/` directory
2. Enable nginx proxy:
```bash
docker-compose -f docker-compose.prod.yml --profile proxy up -d
```

### Reverse Proxy Configuration
Update `nginx.conf` for your domain:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... rest of configuration
}
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- **Backend**: `GET /api/status`
- **Frontend**: `GET /health`
- **Database**: PostgreSQL health check

### Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Metrics
- **System Resources**: `docker stats`
- **Container Status**: `docker-compose -f docker-compose.prod.yml ps`

## 🔄 Maintenance

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
```

### Database Backup
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres kpum_demo > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres kpum_demo < backup.sql
```

### Scaling
```bash
# Scale backend workers
docker-compose -f docker-compose.prod.yml up --scale backend=3 -d
```

## 🛠️ Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port
lsof -i :3000
lsof -i :8000
lsof -i :5432

# Kill process
kill -9 <PID>
```

**Database Connection Issues**
```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Reset database
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

**Frontend Build Issues**
```bash
# Clear node modules and rebuild
docker-compose -f docker-compose.prod.yml down
docker system prune -f
docker-compose -f docker-compose.prod.yml up --build
```

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried columns
2. **Caching**: Implement Redis for session management
3. **CDN**: Use CDN for static assets
4. **Load Balancing**: Use multiple backend instances

## 🔒 Security Considerations

1. **Change Default Passwords**: Update all default credentials
2. **Use HTTPS**: Always use SSL in production
3. **Network Security**: Restrict database access to internal network
4. **Regular Updates**: Keep dependencies updated
5. **Backup Strategy**: Implement automated backups

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify environment variables
3. Check port availability
4. Ensure sufficient system resources

## 🎯 Deployment Checklist

- [ ] Docker and Docker Compose installed
- [ ] Environment variables configured
- [ ] Ports available (3000, 8000, 5432)
- [ ] SSL certificates (for production)
- [ ] Database backup strategy
- [ ] Monitoring setup
- [ ] Security configurations
- [ ] Performance optimization
- [ ] Documentation updated

---

**Happy Deploying! 🚀** 