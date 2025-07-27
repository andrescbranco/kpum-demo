# ☁️ Cloud Deployment Guide

This guide will help you deploy the KPUM Demo system to various cloud platforms so you can share it with others.

## 🚀 Quick Deploy Options

### Option 1: Railway (Recommended - Free & Easy)
### Option 2: Render (Free Tier Available)
### Option 3: Heroku (Paid)
### Option 4: DigitalOcean App Platform

---

## 🚂 Railway Deployment (Recommended)

### Step 1: Prepare Repository
```bash
# Ensure your code is in a Git repository
git add .
git commit -m "Ready for cloud deployment"
git push origin main
```

### Step 2: Deploy to Railway
1. **Visit**: https://railway.app
2. **Sign up** with GitHub
3. **Click "New Project"** → "Deploy from GitHub repo"
4. **Select your repository**
5. **Railway will automatically detect** the Docker setup and deploy

### Step 3: Configure Environment Variables
In Railway dashboard, add these environment variables:
```bash
POSTGRES_USER=kpum_user
POSTGRES_PASSWORD=your_secure_password_123
SECRET_KEY=your_256_bit_secret_key_here
CORS_ORIGINS=https://your-app-name.railway.app
REACT_APP_API_URL=https://your-app-name.railway.app
REACT_APP_WS_URL=wss://your-app-name.railway.app/ws
```

### Step 4: Get Your URL
Railway will provide you with a URL like:
`https://kpum-demo-production.up.railway.app`

---

## 🌊 Render Deployment

### Step 1: Prepare for Render
1. **Visit**: https://render.com
2. **Sign up** with GitHub
3. **Click "New"** → "Web Service"

### Step 2: Connect Repository
1. **Connect your GitHub repository**
2. **Select the repository**
3. **Choose "Docker"** as the environment

### Step 3: Configure Service
- **Name**: `kpum-demo`
- **Environment**: `Docker`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Build Command**: Leave empty (uses Dockerfile)
- **Start Command**: Leave empty (uses Dockerfile)

### Step 4: Environment Variables
Add these in Render dashboard:
```bash
POSTGRES_USER=kpum_user
POSTGRES_PASSWORD=your_secure_password_123
SECRET_KEY=your_256_bit_secret_key_here
CORS_ORIGINS=https://your-app-name.onrender.com
REACT_APP_API_URL=https://your-app-name.onrender.com
REACT_APP_WS_URL=wss://your-app-name.onrender.com/ws
```

### Step 5: Deploy
Click "Create Web Service" and wait for deployment.

---

## 🎯 Heroku Deployment

### Step 1: Install Heroku CLI
```bash
# macOS
brew install heroku/brew/heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login and Create App
```bash
heroku login
heroku create kpum-demo-app
```

### Step 3: Add PostgreSQL
```bash
heroku addons:create heroku-postgresql:mini
```

### Step 4: Set Environment Variables
```bash
heroku config:set SECRET_KEY=your_256_bit_secret_key_here
heroku config:set CORS_ORIGINS=https://your-app-name.herokuapp.com
heroku config:set REACT_APP_API_URL=https://your-app-name.herokuapp.com
heroku config:set REACT_APP_WS_URL=wss://your-app-name.herokuapp.com/ws
```

### Step 5: Deploy
```bash
git push heroku main
```

---

## 🐳 DigitalOcean App Platform

### Step 1: Prepare App Spec
Create `app.yaml`:
```yaml
name: kpum-demo
services:
- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/your-repo
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs

- name: backend
  source_dir: /backend
  github:
    repo: your-username/your-repo
    branch: main
  run_command: uvicorn main:app --host 0.0.0.0 --port $PORT
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs

databases:
- name: postgres
  engine: PG
  version: "15"
```

### Step 2: Deploy
1. **Visit**: https://cloud.digitalocean.com/apps
2. **Click "Create App"**
3. **Connect your GitHub repository**
4. **Upload the app.yaml file**
5. **Configure environment variables**
6. **Deploy**

---

## 🔧 Environment Variables Reference

### Required Variables
```bash
# Database
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password

# Backend
SECRET_KEY=your_256_bit_secret_key
CORS_ORIGINS=https://your-domain.com

# Frontend
REACT_APP_API_URL=https://your-domain.com
REACT_APP_WS_URL=wss://your-domain.com/ws
```

### Optional Variables
```bash
# Environment
ENVIRONMENT=production
PORT=8000

# Additional Security
NODE_ENV=production
```

---

## 🌐 Custom Domain Setup

### Railway
1. **Go to your project** in Railway dashboard
2. **Click "Settings"** → "Domains"
3. **Add your custom domain**
4. **Update CORS_ORIGINS** to include your domain

### Render
1. **Go to your service** in Render dashboard
2. **Click "Settings"** → "Custom Domains"
3. **Add your domain**
4. **Update environment variables**

### Heroku
```bash
heroku domains:add your-domain.com
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- **Backend**: `GET /api/status`
- **Frontend**: `GET /health`
- **Database**: PostgreSQL health check

### Monitoring Commands
```bash
# Check service status
curl https://your-app-url.com/api/status

# Check frontend
curl https://your-app-url.com

# View logs (platform specific)
# Railway: Dashboard → Logs
# Render: Dashboard → Logs
# Heroku: heroku logs --tail
```

---

## 🔒 Security Considerations

### Production Checklist
- [ ] **Strong Passwords**: Use secure database passwords
- [ ] **Secret Keys**: Generate strong secret keys
- [ ] **HTTPS**: Ensure SSL certificates are active
- [ ] **CORS**: Configure allowed origins properly
- [ ] **Environment Variables**: Never commit secrets to Git
- [ ] **Database Backups**: Set up automated backups

### Security Best Practices
```bash
# Generate secure secret key
openssl rand -hex 32

# Generate secure password
openssl rand -base64 32
```

---

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
- Check Dockerfile syntax
- Verify all dependencies are included
- Check platform-specific requirements

**Database Connection Issues**
- Verify environment variables
- Check database service is running
- Ensure proper connection strings

**WebSocket Issues**
- Verify WSS (secure WebSocket) URLs
- Check CORS configuration
- Ensure proper proxy settings

**Performance Issues**
- Monitor resource usage
- Consider scaling up instances
- Optimize Docker images

---

## 📞 Support

### Platform Support
- **Railway**: https://docs.railway.app
- **Render**: https://render.com/docs
- **Heroku**: https://devcenter.heroku.com
- **DigitalOcean**: https://docs.digitalocean.com

### Application Support
- Check logs for error messages
- Verify environment variables
- Test locally before deploying
- Use health check endpoints

---

## 🎉 Success!

Once deployed, you'll have a public URL like:
- Railway: `https://kpum-demo-production.up.railway.app`
- Render: `https://kpum-demo.onrender.com`
- Heroku: `https://kpum-demo-app.herokuapp.com`

**Share this URL with others to let them experience your KPUM Demo system!** 🚀 