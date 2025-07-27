# 🏥 KPUM Demo - Real-Time Hospital Monitoring System

A full-stack real-time hospital monitoring system that simulates vital signs for 30 patients and provides an interactive dashboard for medical decision-making with **Knowledge Processing and Understanding Machines (KPUM)** capabilities.

## 🚀 Quick Deployment

```bash
# Clone the repository
git clone <your-repo-url>
cd kpum-demo

# Deploy with one command
./deploy.sh

# Check system health
./health-check.sh
```

**Access the system:**
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:8000
- 📊 **API Status**: http://localhost:8000/api/status

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🏗️ System Architecture

### Frontend (React + TypeScript)
- Real-time dashboard with 30 patient cards
- Color-coded status indicators (green/yellow/red)
- Interactive modals for treatment decisions
- WebSocket connection for live updates

### Backend (FastAPI)
- Real-time vital signs simulation engine
- WebSocket streaming for live data
- Patient status classification (normal/watch/critical)
- Treatment and dispatch decision APIs

### Database (PostgreSQL)
- Patient profiles and medical history
- Time-series vital signs data
- Treatment logs and dispatch records

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL
- Docker (optional)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
# Frontend will be available at http://localhost:3000
```

### Database Setup
```bash
# Create database and run migrations
createdb kpum_demo
cd backend
alembic upgrade head
```

## 📊 Features

### Patient Simulation
- 30 unique patients with realistic profiles
- Random ages (45-85), medical conditions
- Fixed room assignments

### Real-Time Vitals
- Heart Rate (HR)
- Blood Pressure (Systolic/Diastolic)
- Respiratory Rate (RR)
- Oxygen Saturation (SpO₂)
- Temperature
- EKG waveform simulation

### Status Classification
- **Normal**: All vitals within range
- **Watch**: One or more vitals in warning range
- **Critical**: Multiple critical vitals or suspicious EKG

### Interactive Dashboard
- Real-time patient grid
- Color-coded status cards
- Treatment decision modals
- Dispatch confirmation workflow

## 🔧 Configuration

Environment variables (see `.env.example`):
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret for authentication
- `CORS_ORIGINS`: Allowed frontend origins

## 📈 Data Flow

1. **Simulation Engine** generates vitals every second
2. **Classification Engine** evaluates patient status
3. **WebSocket** streams data to frontend
4. **Dashboard** displays real-time updates
5. **User Actions** trigger treatment/dispatch workflows
6. **Audit Trail** logs all decisions

## 🚀 Deployment

### Production Deployment
```bash
# Deploy to production
docker-compose -f docker-compose.prod.yml up --build -d

# Check deployment status
./health-check.sh

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Environment Configuration
Create a `.env` file with your production settings:
```bash
# Database
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_secure_password

# Backend
SECRET_KEY=your_256_bit_secret_key
CORS_ORIGINS=https://yourdomain.com

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WS_URL=wss://api.yourdomain.com/ws
```

For complete deployment documentation, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🧪 Testing
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📝 API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

## 🏥 Demo Scenarios

The system simulates realistic hospital scenarios:
- Normal monitoring (70% of time)
- Watch conditions (20% of time)
- Critical events (10% of time)

Each scenario includes appropriate treatment recommendations and dispatch protocols. 