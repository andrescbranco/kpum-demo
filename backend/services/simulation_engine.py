import asyncio
import json
import logging
import random
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from models.patient import Patient, PatientCreate
from models.vitals import Vitals, VitalsCreate
from database import SessionLocal
from services.classification_engine import ClassificationEngine
from services.websocket_manager import WebSocketManager

logger = logging.getLogger(__name__)

class SimulationEngine:
    def __init__(self, classification_engine: ClassificationEngine, websocket_manager: WebSocketManager):
        self.classification_engine = classification_engine
        self.websocket_manager = websocket_manager
        self.patients: List[Patient] = []
        self.is_running = False
        self.simulation_task: Optional[asyncio.Task] = None
        
        # Patient names for realistic simulation
        self.first_names = [
            "John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa",
            "William", "Jennifer", "Richard", "Mary", "Joseph", "Linda", "Thomas",
            "Patricia", "Christopher", "Barbara", "Daniel", "Elizabeth", "Matthew",
            "Jessica", "Anthony", "Sarah", "Mark", "Karen", "Donald", "Nancy",
            "Steven", "Betty", "Paul", "Helen", "Andrew", "Sandra", "Joshua",
            "Donna", "Kenneth", "Carol", "Kevin", "Ruth", "Brian", "Sharon",
            "George", "Michelle", "Edward", "Laura", "Ronald", "Emily", "Timothy"
        ]
        
        self.last_names = [
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
            "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
            "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
            "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
            "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
            "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
            "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell"
        ]
        
        # Medical conditions
        self.medical_conditions = [
            "Hypertension", "Diabetes Type 2", "COPD", "Heart Disease",
            "Asthma", "Obesity", "Kidney Disease", "Liver Disease",
            "Cancer", "Stroke History", "Dementia", "Arthritis",
            "Depression", "Anxiety", "Sleep Apnea", "GERD"
        ]
    
    async def start_simulation(self):
        """Start the vital signs simulation"""
        if self.is_running:
            logger.warning("Simulation already running")
            return
        
        # Initialize patients if not already done
        await self._initialize_patients()
        
        self.is_running = True
        self.simulation_task = asyncio.create_task(self._simulation_loop())
        logger.info("Vital signs simulation started")
    
    async def stop_simulation(self):
        """Stop the vital signs simulation"""
        self.is_running = False
        if self.simulation_task:
            self.simulation_task.cancel()
            try:
                await self.simulation_task
            except asyncio.CancelledError:
                pass
        logger.info("Vital signs simulation stopped")
    
    async def _initialize_patients(self):
        """Initialize 30 patients in the database"""
        db = SessionLocal()
        try:
            # Check if patients already exist
            existing_patients = db.query(Patient).count()
            if existing_patients >= 30:
                self.patients = db.query(Patient).limit(30).all()
                logger.info(f"Using existing {len(self.patients)} patients")
                return
            
            # Create 30 new patients
            logger.info("Creating 30 new patients...")
            for i in range(30):
                if i == 0:  # Patient 1 - Critical (Heart Attack)
                    patient_data = {
                        "name": f"{random.choice(self.first_names)} {random.choice(self.last_names)}",
                        "age": random.randint(45, 85),
                        "sex": random.choice(["M", "F"]),
                        "room_id": f"Room-{i+1:02d}",
                        "medical_conditions": "Acute Myocardial Infarction; Hypertension; Diabetes Type 2"
                    }
                elif i == 1:  # Patient 2 - Watch (Hypertension)
                    patient_data = {
                        "name": f"{random.choice(self.first_names)} {random.choice(self.last_names)}",
                        "age": random.randint(45, 85),
                        "sex": random.choice(["M", "F"]),
                        "room_id": f"Room-{i+1:02d}",
                        "medical_conditions": "Hypertensive Crisis; Chronic Kidney Disease"
                    }
                elif i == 2:  # Patient 3 - Watch (Respiratory Distress)
                    patient_data = {
                        "name": f"{random.choice(self.first_names)} {random.choice(self.last_names)}",
                        "age": random.randint(45, 85),
                        "sex": random.choice(["M", "F"]),
                        "room_id": f"Room-{i+1:02d}",
                        "medical_conditions": "COPD Exacerbation; Pneumonia"
                    }
                elif i == 3:  # Patient 4 - Watch (Sepsis)
                    patient_data = {
                        "name": f"{random.choice(self.first_names)} {random.choice(self.last_names)}",
                        "age": random.randint(45, 85),
                        "sex": random.choice(["M", "F"]),
                        "room_id": f"Room-{i+1:02d}",
                        "medical_conditions": "Sepsis; Urinary Tract Infection; Diabetes Type 2"
                    }
                else:
                    patient_data = self._generate_patient_data(i + 1)
                
                patient = Patient(**patient_data)
                db.add(patient)
            
            db.commit()
            self.patients = db.query(Patient).limit(30).all()
            logger.info(f"Created {len(self.patients)} patients")
            
        except Exception as e:
            logger.error(f"Error initializing patients: {e}")
            db.rollback()
        finally:
            db.close()
    
    def _generate_patient_data(self, patient_id: int) -> Dict[str, Any]:
        """Generate realistic patient data"""
        first_name = random.choice(self.first_names)
        last_name = random.choice(self.last_names)
        age = random.randint(45, 85)
        sex = random.choice(["M", "F"])
        room_id = f"Room-{patient_id:02d}"
        
        # Generate medical conditions (0-3 conditions per patient)
        num_conditions = random.choices([0, 1, 2, 3], weights=[0.3, 0.4, 0.2, 0.1])[0]
        conditions = random.sample(self.medical_conditions, num_conditions) if num_conditions > 0 else []
        medical_conditions = "; ".join(conditions) if conditions else None
        
        return {
            "name": f"{first_name} {last_name}",
            "age": age,
            "sex": sex,
            "room_id": room_id,
            "medical_conditions": medical_conditions
        }
    
    async def _simulation_loop(self):
        """Main simulation loop that generates vitals every second"""
        while self.is_running:
            try:
                # Generate vitals for all patients
                vitals_data = {}
                
                for patient in self.patients:
                    vitals = self._generate_vitals(patient)
                    
                    # Classify the vitals
                    status, reason, recommended_action = self.classification_engine.classify_vitals(vitals)
                    
                    # Store vitals in database
                    await self._store_vitals(patient.id, vitals, status, reason, recommended_action)
                    
                    # Prepare data for WebSocket broadcast
                    vitals_data[patient.id] = {
                        "patient_id": patient.id,
                        "patient_name": patient.name,
                        "room_id": patient.room_id,
                        "vitals": vitals,
                        "status": status,
                        "reason": reason,
                        "recommended_action": recommended_action
                    }
                
                # Broadcast to all connected clients
                await self.websocket_manager.broadcast_vitals(vitals_data)
                
                # Wait 3 seconds before next update
                await asyncio.sleep(3)
                
            except Exception as e:
                logger.error(f"Error in simulation loop: {e}")
                await asyncio.sleep(1)
    
    def _generate_vitals(self, patient: Patient) -> Dict[str, float]:
        """Generate realistic vital signs for a patient"""
        
        # Create specific critical and watch conditions for demonstration
        if patient.id == 1:  # Patient 1 - Critical (Heart Attack)
            hr = random.uniform(110, 130)  # High heart rate
            systolic = random.uniform(180, 200)  # Very high BP
            diastolic = random.uniform(100, 120)  # High diastolic
            rr = random.uniform(25, 30)  # High respiratory rate
            spo2 = random.uniform(85, 90)  # Low oxygen
            temp = random.uniform(37.8, 38.5)  # Elevated temperature
            ekg_data = self._generate_critical_ekg_data()
            
        elif patient.id == 2:  # Patient 2 - Watch (Hypertension)
            hr = random.uniform(95, 110)  # Elevated heart rate
            systolic = random.uniform(160, 180)  # High systolic
            diastolic = random.uniform(95, 105)  # High diastolic
            rr = random.uniform(20, 25)  # Elevated respiratory rate
            spo2 = random.uniform(92, 95)  # Slightly low oxygen
            temp = random.uniform(37.2, 37.8)  # Slightly elevated
            ekg_data = self._generate_normal_ekg_data()
            
        elif patient.id == 3:  # Patient 3 - Watch (Respiratory Distress)
            hr = random.uniform(95, 110)  # Elevated heart rate
            systolic = random.uniform(150, 170)  # Elevated systolic
            diastolic = random.uniform(85, 95)  # Normal diastolic
            rr = random.uniform(25, 30)  # High respiratory rate
            spo2 = random.uniform(88, 92)  # Low oxygen
            temp = random.uniform(37.8, 38.5)  # Elevated temperature
            ekg_data = self._generate_normal_ekg_data()
            
        elif patient.id == 4:  # Patient 4 - Watch (Sepsis)
            hr = random.uniform(100, 115)  # High heart rate
            systolic = random.uniform(90, 110)  # Low systolic
            diastolic = random.uniform(50, 65)  # Low diastolic
            rr = random.uniform(22, 28)  # High respiratory rate
            spo2 = random.uniform(90, 94)  # Low oxygen
            temp = random.uniform(38.5, 39.0)  # High fever
            ekg_data = self._generate_normal_ekg_data()
            
        else:  # Normal patients
            # Base values with some randomness
            base_hr = random.randint(65, 85)
            base_systolic = random.randint(110, 130)
            base_diastolic = random.randint(70, 85)
            base_rr = random.randint(14, 18)
            base_spo2 = random.uniform(96.0, 99.0)
            base_temp = random.uniform(36.8, 37.2)
            
            # Add some variation based on patient characteristics
            if "Heart Disease" in (patient.medical_conditions or ""):
                base_hr += random.randint(-10, 15)
                base_systolic += random.randint(-5, 20)
            
            if "COPD" in (patient.medical_conditions or ""):
                base_rr += random.randint(2, 6)
                base_spo2 -= random.uniform(1.0, 3.0)
            
            if "Diabetes" in (patient.medical_conditions or ""):
                base_temp += random.uniform(0.2, 0.8)
            
            # Add random noise
            hr = base_hr + random.uniform(-5, 5)
            systolic = base_systolic + random.uniform(-8, 8)
            diastolic = base_diastolic + random.uniform(-5, 5)
            rr = base_rr + random.uniform(-2, 2)
            spo2 = base_spo2 + random.uniform(-1, 1)
            temp = base_temp + random.uniform(-0.3, 0.3)
            ekg_data = self._generate_normal_ekg_data()
        
        return {
            "heart_rate": max(40, min(180, hr)),
            "systolic_bp": max(70, min(200, systolic)),
            "diastolic_bp": max(40, min(120, diastolic)),
            "respiratory_rate": max(8, min(30, rr)),
            "oxygen_saturation": max(85, min(100, spo2)),
            "temperature": max(35.5, min(39.0, temp)),
            "ekg_data": ekg_data
        }
    
    def _generate_normal_ekg_data(self) -> str:
        """Generate normal EKG waveform data"""
        # Generate 50 data points representing EKG waveform
        t = np.linspace(0, 2*np.pi, 50)
        
        # Normal sinus rhythm with some noise
        signal = np.sin(t) + 0.3 * np.sin(3*t) + 0.1 * np.random.randn(50)
        
        # Occasionally add minor arrhythmia patterns
        if random.random() < 0.05:  # 5% chance of minor arrhythmia
            # Add irregular beats
            arrhythmia_points = random.sample(range(50), 3)
            for point in arrhythmia_points:
                signal[point] += random.uniform(-1, 1)
        
        # Convert to string format
        return ",".join([f"{val:.3f}" for val in signal])
    
    def _generate_critical_ekg_data(self) -> str:
        """Generate critical EKG waveform data (arrhythmia)"""
        # Generate 50 data points representing EKG waveform
        t = np.linspace(0, 2*np.pi, 50)
        
        # Normal sinus rhythm base
        signal = np.sin(t) + 0.3 * np.sin(3*t)
        
        # Add severe arrhythmia patterns (ST elevation, irregular beats)
        arrhythmia_points = random.sample(range(50), 8)
        for point in arrhythmia_points:
            signal[point] += random.uniform(-2, 2)  # Large variations
        
        # Add ST elevation (heart attack pattern)
        st_elevation_points = range(20, 30)
        for point in st_elevation_points:
            signal[point] += 1.5  # ST elevation
        
        # Add noise
        signal += 0.2 * np.random.randn(50)
        
        return ",".join([f"{val:.3f}" for val in signal])
    
    async def _store_vitals(self, patient_id: int, vitals: Dict[str, float], 
                           status: str, reason: str, recommended_action: str):
        """Store vitals data in database"""
        db = SessionLocal()
        try:
            vitals_record = Vitals(
                patient_id=patient_id,
                heart_rate=vitals["heart_rate"],
                systolic_bp=vitals["systolic_bp"],
                diastolic_bp=vitals["diastolic_bp"],
                respiratory_rate=vitals["respiratory_rate"],
                oxygen_saturation=vitals["oxygen_saturation"],
                temperature=vitals["temperature"],
                ekg_data=vitals["ekg_data"],
                status=status,
                classification_reason=reason,
                recommended_action=recommended_action
            )
            
            db.add(vitals_record)
            db.commit()
            
        except Exception as e:
            logger.error(f"Error storing vitals: {e}")
            db.rollback()
        finally:
            db.close()
    
    def get_patient_status_summary(self) -> Dict[str, int]:
        """Get summary of patient statuses"""
        if not self.patients:
            return {"normal": 0, "watch": 0, "critical": 0}
        
        # This would typically query the latest vitals from database
        # For now, return a simple summary
        return {
            "normal": len([p for p in self.patients if hasattr(p, 'status') and p.status == 'normal']),
            "watch": len([p for p in self.patients if hasattr(p, 'status') and p.status == 'watch']),
            "critical": len([p for p in self.patients if hasattr(p, 'status') and p.status == 'critical'])
        } 