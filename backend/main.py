from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random
import time

from models.database import engine, Base
from models.patient import Patient, PatientCreate, PatientResponse
from models.vitals import Vitals, VitalsCreate, VitalsResponse
from models.treatment import Treatment, TreatmentCreate, TreatmentResponse
from models.dispatch import Dispatch, DispatchCreate, DispatchResponse
from services.simulation_engine import SimulationEngine
from services.classification_engine import ClassificationEngine
from services.websocket_manager import WebSocketManager
from database import get_db, SessionLocal, test_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for simulation
simulation_engine: Optional[SimulationEngine] = None
classification_engine: Optional[ClassificationEngine] = None
websocket_manager: Optional[WebSocketManager] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global simulation_engine, classification_engine, websocket_manager
    
    # Wait for database to be ready
    logger.info("Waiting for database connection...")
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        if test_connection():
            break
        retry_count += 1
        logger.info(f"Database connection attempt {retry_count}/{max_retries} failed, retrying in 2 seconds...")
        time.sleep(2)
    
    if retry_count >= max_retries:
        logger.error("Failed to connect to database after maximum retries")
        raise Exception("Database connection failed")
    
    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise
    
    # Initialize services
    classification_engine = ClassificationEngine()
    websocket_manager = WebSocketManager()
    simulation_engine = SimulationEngine(
        classification_engine=classification_engine,
        websocket_manager=websocket_manager
    )
    
    # Start simulation in background
    asyncio.create_task(simulation_engine.start_simulation())
    
    logger.info("KPUM Demo system started successfully")
    yield
    
    # Shutdown
    if simulation_engine:
        await simulation_engine.stop_simulation()
    logger.info("KPUM Demo system shutdown complete")

app = FastAPI(
    title="KPUM Demo API",
    description="Real-time hospital monitoring system API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - updated to include the actual Render URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://localhost:3001", 
        "http://127.0.0.1:3001",
        "https://kpum-demo-1.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket endpoint for real-time data
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket_manager.add_connection(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        await websocket_manager.remove_connection(websocket)

# Patient endpoints
@app.get("/api/patients", response_model=List[PatientResponse])
async def get_patients(db: SessionLocal = Depends(get_db)):
    """Get all patients"""
    patients = db.query(Patient).all()
    return [PatientResponse.from_orm(patient) for patient in patients]

@app.get("/api/patients/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: int, db: SessionLocal = Depends(get_db)):
    """Get a specific patient"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientResponse.from_orm(patient)

@app.post("/api/patients", response_model=PatientResponse)
async def create_patient(patient: PatientCreate, db: SessionLocal = Depends(get_db)):
    """Create a new patient"""
    db_patient = Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return PatientResponse.from_orm(db_patient)

# Vitals endpoints
@app.get("/api/patients/{patient_id}/vitals", response_model=List[VitalsResponse])
async def get_patient_vitals(
    patient_id: int, 
    limit: int = 100,
    db: SessionLocal = Depends(get_db)
):
    """Get vitals history for a patient"""
    vitals = db.query(Vitals).filter(
        Vitals.patient_id == patient_id
    ).order_by(Vitals.timestamp.desc()).limit(limit).all()
    return [VitalsResponse.from_orm(vital) for vital in vitals]

@app.get("/api/vitals/latest", response_model=Dict[int, VitalsResponse])
async def get_latest_vitals(db: SessionLocal = Depends(get_db)):
    """Get latest vitals for all patients"""
    # Get the latest vitals for each patient
    latest_vitals = {}
    for patient in db.query(Patient).all():
        latest = db.query(Vitals).filter(
            Vitals.patient_id == patient.id
        ).order_by(Vitals.timestamp.desc()).first()
        if latest:
            latest_vitals[patient.id] = VitalsResponse.from_orm(latest)
    return latest_vitals

# Treatment endpoints
@app.post("/api/treatments", response_model=TreatmentResponse)
async def create_treatment(treatment: TreatmentCreate, db: SessionLocal = Depends(get_db)):
    """Create a treatment decision"""
    db_treatment = Treatment(**treatment.dict())
    db.add(db_treatment)
    db.commit()
    db.refresh(db_treatment)
    return TreatmentResponse.from_orm(db_treatment)

@app.get("/api/patients/{patient_id}/treatments", response_model=List[TreatmentResponse])
async def get_patient_treatments(patient_id: int, db: SessionLocal = Depends(get_db)):
    """Get treatment history for a patient"""
    treatments = db.query(Treatment).filter(
        Treatment.patient_id == patient_id
    ).order_by(Treatment.timestamp.desc()).all()
    return [TreatmentResponse.from_orm(treatment) for treatment in treatments]

# Dispatch endpoints
@app.post("/api/dispatches", response_model=DispatchResponse)
async def create_dispatch(dispatch: DispatchCreate, db: SessionLocal = Depends(get_db)):
    """Create a dispatch decision"""
    db_dispatch = Dispatch(**dispatch.dict())
    db.add(db_dispatch)
    db.commit()
    db.refresh(db_dispatch)
    return DispatchResponse.from_orm(db_dispatch)

@app.get("/api/dispatches", response_model=List[DispatchResponse])
async def get_dispatches(db: SessionLocal = Depends(get_db)):
    """Get all dispatch records"""
    dispatches = db.query(Dispatch).order_by(Dispatch.timestamp.desc()).all()
    return [DispatchResponse.from_orm(dispatch) for dispatch in dispatches]

# System status endpoint
@app.get("/api/status")
async def get_system_status():
    """Get system status and statistics"""
    if not simulation_engine:
        raise HTTPException(status_code=503, detail="Simulation engine not initialized")
    
    return {
        "status": "running",
        "patients_count": len(simulation_engine.patients),
        "active_connections": len(websocket_manager.active_connections),
        "simulation_started": simulation_engine.is_running,
        "last_update": datetime.now().isoformat()
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 