from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.database import Base

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    sex = Column(String, nullable=False)
    room_id = Column(String, nullable=False, unique=True)
    medical_conditions = Column(Text, nullable=True)
    admission_date = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    vitals = relationship("Vitals", back_populates="patient")
    treatments = relationship("Treatment", back_populates="patient")
    dispatches = relationship("Dispatch", back_populates="patient")

class PatientCreate(BaseModel):
    name: str
    age: int
    sex: str
    room_id: str
    medical_conditions: Optional[str] = None

class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    sex: str
    room_id: str
    medical_conditions: Optional[str]
    admission_date: datetime
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True 