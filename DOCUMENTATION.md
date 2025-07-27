# KPUM Demo - Comprehensive Documentation

## 🏥 System Overview

The KPUM Demo is a full-stack real-time hospital monitoring system that simulates vital signs for 30 patients and provides an interactive dashboard for medical decision-making. The system demonstrates key concepts in Knowledge Processing and Understanding Machines (KPUM) through symbolic reasoning and human-in-the-loop decision making.

## 🏗️ Architecture

### Backend (FastAPI + PostgreSQL)
- **Real-time Simulation Engine**: Generates vital signs every second for 30 patients
- **Classification Engine**: Evaluates vitals and determines patient status (normal/watch/critical)
- **WebSocket Manager**: Streams real-time data to frontend
- **REST API**: Handles treatment and dispatch decisions
- **Database**: Stores patient data, vitals history, and decision logs

### Frontend (React + TypeScript)
- **Real-time Dashboard**: Displays 30 patient cards with live vitals
- **Interactive Modals**: Treatment and dispatch decision interfaces
- **WebSocket Client**: Receives real-time updates
- **Responsive Design**: Works on desktop and tablet devices

### Database (PostgreSQL)
- **Patient Profiles**: Static patient information
- **Vitals Time Series**: Historical vital signs data
- **Treatment Logs**: Recorded treatment decisions
- **Dispatch Records**: Emergency dispatch decisions

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd kpum-demo

# Run the setup script
./setup.sh

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup
```bash
# Backend Setup
cd backend
pip install -r requirements.txt
cp env.example .env
# Edit .env with your database settings
uvicorn main:app --reload

# Frontend Setup
cd frontend
npm install
cp env.example .env
npm start
```

## 📊 Features

### Patient Simulation
- **30 Unique Patients**: Random names, ages (45-85), medical conditions
- **Realistic Profiles**: Each patient has medical history and room assignment
- **Dynamic Vitals**: Heart rate, blood pressure, respiratory rate, oxygen saturation, temperature
- **EKG Simulation**: Simplified waveform generation with arrhythmia patterns

### Real-time Monitoring
- **Live Updates**: Vital signs update every second
- **Status Classification**: Automatic evaluation into normal/watch/critical
- **WebSocket Streaming**: Real-time data transmission
- **Visual Indicators**: Color-coded patient cards with animations

### Decision Making Interface
- **Watch Status**: Treatment decisions for mildly abnormal vitals
- **Critical Status**: Emergency dispatch decisions for critical patients
- **Audit Trail**: All decisions logged with timestamps and notes
- **Human-in-the-Loop**: Requires explicit confirmation for actions

### Status Classification Logic

#### Normal Status (70% of time)
- All vitals within normal ranges
- No action required
- Green indicator

#### Watch Status (20% of time)
- One or more vitals in warning range
- Treatment recommendations provided
- Yellow indicator with pulsing animation
- Click to open treatment modal

#### Critical Status (10% of time)
- Multiple critical vitals or suspicious EKG
- Emergency dispatch recommendations
- Red indicator with pulsing animation
- Click to open dispatch modal

## 🎯 User Interface

### Dashboard Layout
- **Header**: System status and connection indicators
- **Patient Grid**: 30 patient cards in responsive layout
- **Status Bar**: Real-time system statistics
- **Footer**: Connection and update information

### Patient Cards
Each card displays:
- Patient name and room
- Age and sex
- Current vital signs
- Status indicator (green/yellow/red)
- Action prompts for interactive cards

### Treatment Modal
For patients in "watch" status:
- Vital signs display with normal ranges
- Recommended treatment action
- Decision options: Accept, Edit, Ignore
- Optional notes field

### Dispatch Modal
For patients in "critical" status:
- Critical vitals display
- Emergency dispatch package
- Decision options: Confirm, Deny, Wait
- Optional notes field

## 🔧 Technical Details

### Backend Services

#### Simulation Engine (`services/simulation_engine.py`)
- Generates realistic vital signs based on patient characteristics
- Manages 30 patient instances
- Updates vitals every second
- Stores data in PostgreSQL

#### Classification Engine (`services/classification_engine.py`)
- Evaluates vital signs against medical ranges
- Determines patient status (normal/watch/critical)
- Generates human-readable reasoning
- Provides recommended actions

#### WebSocket Manager (`services/websocket_manager.py`)
- Manages real-time connections
- Broadcasts vitals updates
- Handles connection lifecycle
- Supports multiple concurrent clients

### Database Schema

#### Patients Table
```sql
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    age INTEGER NOT NULL,
    sex VARCHAR NOT NULL,
    room_id VARCHAR UNIQUE NOT NULL,
    medical_conditions TEXT,
    admission_date TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

#### Vitals Table
```sql
CREATE TABLE vitals (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    timestamp TIMESTAMP DEFAULT NOW(),
    heart_rate FLOAT NOT NULL,
    systolic_bp FLOAT NOT NULL,
    diastolic_bp FLOAT NOT NULL,
    respiratory_rate FLOAT NOT NULL,
    oxygen_saturation FLOAT NOT NULL,
    temperature FLOAT NOT NULL,
    ekg_data TEXT,
    status VARCHAR NOT NULL,
    classification_reason TEXT,
    recommended_action TEXT
);
```

#### Treatments Table
```sql
CREATE TABLE treatments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    timestamp TIMESTAMP DEFAULT NOW(),
    treatment_type VARCHAR NOT NULL,
    treatment_description TEXT NOT NULL,
    prescribed_by VARCHAR NOT NULL,
    decision VARCHAR NOT NULL,
    notes TEXT
);
```

#### Dispatches Table
```sql
CREATE TABLE dispatches (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    timestamp TIMESTAMP DEFAULT NOW(),
    dispatch_type VARCHAR NOT NULL,
    destination VARCHAR NOT NULL,
    estimated_eta TIMESTAMP,
    priority VARCHAR NOT NULL,
    decision VARCHAR NOT NULL,
    reason TEXT NOT NULL,
    confirmed_by VARCHAR NOT NULL,
    notes TEXT
);
```

### API Endpoints

#### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/{id}` - Get specific patient
- `POST /api/patients` - Create new patient

#### Vitals
- `GET /api/patients/{id}/vitals` - Get patient vitals history
- `GET /api/vitals/latest` - Get latest vitals for all patients

#### Treatments
- `POST /api/treatments` - Create treatment decision
- `GET /api/patients/{id}/treatments` - Get patient treatment history

#### Dispatches
- `POST /api/dispatches` - Create dispatch decision
- `GET /api/dispatches` - Get all dispatch records

#### System
- `GET /api/status` - Get system status
- `GET /health` - Health check
- `WS /ws` - WebSocket endpoint

### WebSocket Messages

#### Vitals Update
```json
{
  "type": "vitals_update",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "1": {
      "patient_id": 1,
      "patient_name": "John Smith",
      "room_id": "Room-01",
      "vitals": {
        "heart_rate": 75,
        "systolic_bp": 120,
        "diastolic_bp": 80,
        "respiratory_rate": 16,
        "oxygen_saturation": 98,
        "temperature": 37.0
      },
      "status": "normal",
      "reason": "All vital signs within normal ranges",
      "recommended_action": "Continue monitoring"
    }
  }
}
```

#### Status Change
```json
{
  "type": "status_change",
  "timestamp": "2024-01-01T12:00:00Z",
  "patient_id": 1,
  "status": "watch",
  "reason": "Elevated heart rate detected"
}
```

## 🧪 Testing Scenarios

### Normal Monitoring
- 70% of patients remain in normal status
- Green indicators, no action required
- Passive monitoring mode

### Watch Scenarios
- Elevated heart rate (>100 bpm)
- Low oxygen saturation (<95%)
- High blood pressure (>140/90)
- Elevated temperature (>37.5°C)
- Treatment decisions required

### Critical Scenarios
- Multiple critical vitals
- Severe arrhythmia patterns
- Respiratory distress
- Emergency dispatch decisions required

## 🔍 Monitoring and Logging

### System Monitoring
- Real-time connection status
- Patient count and status distribution
- WebSocket connection count
- Simulation status

### Decision Logging
- All treatment decisions logged with timestamps
- All dispatch decisions logged with details
- Complete audit trail for compliance
- Optional notes for context

### Performance Metrics
- Vital signs update frequency
- WebSocket message latency
- Database query performance
- Frontend render performance

## 🚀 Deployment

### Production Considerations
- Use production PostgreSQL instance
- Configure proper CORS settings
- Set secure secret keys
- Enable HTTPS for WebSocket connections
- Implement proper logging
- Add monitoring and alerting

### Scaling
- Horizontal scaling of backend instances
- Load balancing for WebSocket connections
- Database connection pooling
- Redis for session management
- CDN for frontend assets

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,http://yourdomain.com
LOG_LEVEL=INFO
SIMULATION_INTERVAL=1
SIMULATION_PATIENTS=30
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_ENV=development
```

## 📚 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation powered by Swagger UI.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

#### Database Connection
- Ensure PostgreSQL is running
- Check database credentials in .env
- Verify database exists

#### WebSocket Connection
- Check CORS settings
- Verify WebSocket URL
- Check browser console for errors

#### Frontend Not Loading
- Ensure backend is running
- Check API URL configuration
- Verify all dependencies installed

#### Simulation Not Starting
- Check backend logs
- Verify patient creation
- Check database permissions

### Logs and Debugging
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs
3. Open an issue on GitHub
4. Contact the development team 