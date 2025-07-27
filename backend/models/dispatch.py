from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.database import Base

class Dispatch(Base):
    __tablename__ = "dispatches"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    timestamp = Column(DateTime, default=func.now())
    
    # Dispatch details
    dispatch_type = Column(String, nullable=False)  # ambulance, helicopter, etc.
    destination = Column(String, nullable=False)
    estimated_eta = Column(DateTime, nullable=True)
    priority = Column(String, nullable=False)  # low, medium, high, critical
    
    # Decision details
    decision = Column(String, nullable=False)  # confirmed, denied, wait
    reason = Column(Text, nullable=False)
    confirmed_by = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    
    # Relationship
    patient = relationship("Patient", back_populates="dispatches")

class DispatchCreate(BaseModel):
    patient_id: int
    dispatch_type: str
    destination: str
    estimated_eta: Optional[datetime] = None
    priority: str
    decision: str
    reason: str
    confirmed_by: str
    notes: Optional[str] = None

class DispatchResponse(BaseModel):
    id: int
    patient_id: int
    timestamp: datetime
    dispatch_type: str
    destination: str
    estimated_eta: Optional[datetime]
    priority: str
    decision: str
    reason: str
    confirmed_by: str
    notes: Optional[str]
    
    class Config:
        from_attributes = True 