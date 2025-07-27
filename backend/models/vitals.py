from sqlalchemy import Column, Integer, Float, DateTime, String, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.database import Base

class Vitals(Base):
    __tablename__ = "vitals"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    timestamp = Column(DateTime, default=func.now())
    
    # Vital signs
    heart_rate = Column(Float, nullable=False)
    systolic_bp = Column(Float, nullable=False)
    diastolic_bp = Column(Float, nullable=False)
    respiratory_rate = Column(Float, nullable=False)
    oxygen_saturation = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    
    # EKG data (stored as JSON string)
    ekg_data = Column(Text, nullable=True)
    
    # Classification
    status = Column(String, nullable=False)  # normal, watch, critical
    classification_reason = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    
    # Relationship
    patient = relationship("Patient", back_populates="vitals")

class VitalsCreate(BaseModel):
    patient_id: int
    heart_rate: float
    systolic_bp: float
    diastolic_bp: float
    respiratory_rate: float
    oxygen_saturation: float
    temperature: float
    ekg_data: Optional[str] = None
    status: str
    classification_reason: Optional[str] = None
    recommended_action: Optional[str] = None

class VitalsResponse(BaseModel):
    id: int
    patient_id: int
    timestamp: datetime
    heart_rate: float
    systolic_bp: float
    diastolic_bp: float
    respiratory_rate: float
    oxygen_saturation: float
    temperature: float
    ekg_data: Optional[str]
    status: str
    classification_reason: Optional[str]
    recommended_action: Optional[str]
    
    class Config:
        from_attributes = True 