from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.database import Base

class Treatment(Base):
    __tablename__ = "treatments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    timestamp = Column(DateTime, default=func.now())
    
    # Treatment details
    treatment_type = Column(String, nullable=False)  # medication, procedure, monitoring
    treatment_description = Column(Text, nullable=False)
    prescribed_by = Column(String, nullable=False)
    
    # Decision details
    decision = Column(String, nullable=False)  # accepted, modified, ignored
    notes = Column(Text, nullable=True)
    
    # Relationship
    patient = relationship("Patient", back_populates="treatments")

class TreatmentCreate(BaseModel):
    patient_id: int
    treatment_type: str
    treatment_description: str
    prescribed_by: str
    decision: str
    notes: Optional[str] = None

class TreatmentResponse(BaseModel):
    id: int
    patient_id: int
    timestamp: datetime
    treatment_type: str
    treatment_description: str
    prescribed_by: str
    decision: str
    notes: Optional[str]
    
    class Config:
        from_attributes = True 