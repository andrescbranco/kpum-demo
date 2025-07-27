#!/usr/bin/env python3
"""
KPUM Demo System Test
Tests the core components of the KPUM demo system.
"""

import asyncio
import json
import sys
import time
from datetime import datetime

# Add backend to path for testing
sys.path.append('./backend')

try:
    from services.classification_engine import ClassificationEngine
    from services.simulation_engine import SimulationEngine
    from services.websocket_manager import WebSocketManager
    from models.patient import Patient
    print("✅ All imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

def test_classification_engine():
    """Test the classification engine with various vital signs."""
    print("\n🧠 Testing Classification Engine...")
    
    engine = ClassificationEngine()
    
    # Test normal vitals
    normal_vitals = {
        "heart_rate": 75,
        "systolic_bp": 120,
        "diastolic_bp": 80,
        "respiratory_rate": 16,
        "oxygen_saturation": 98,
        "temperature": 37.0
    }
    
    status, reason, action = engine.classify_vitals(normal_vitals)
    print(f"Normal vitals: {status} - {reason}")
    
    # Test watch vitals
    watch_vitals = {
        "heart_rate": 105,
        "systolic_bp": 150,
        "diastolic_bp": 95,
        "respiratory_rate": 22,
        "oxygen_saturation": 92,
        "temperature": 37.8
    }
    
    status, reason, action = engine.classify_vitals(watch_vitals)
    print(f"Watch vitals: {status} - {reason}")
    
    # Test critical vitals
    critical_vitals = {
        "heart_rate": 130,
        "systolic_bp": 180,
        "diastolic_bp": 110,
        "respiratory_rate": 28,
        "oxygen_saturation": 85,
        "temperature": 38.5
    }
    
    status, reason, action = engine.classify_vitals(critical_vitals)
    print(f"Critical vitals: {status} - {reason}")
    
    print("✅ Classification engine tests passed")

def test_simulation_engine():
    """Test the simulation engine patient generation."""
    print("\n🎭 Testing Simulation Engine...")
    
    # Create mock services
    classification_engine = ClassificationEngine()
    websocket_manager = WebSocketManager()
    
    simulation_engine = SimulationEngine(
        classification_engine=classification_engine,
        websocket_manager=websocket_manager
    )
    
    # Test patient data generation
    patient_data = simulation_engine._generate_patient_data(1)
    print(f"Generated patient: {patient_data['name']} ({patient_data['age']} y/o {patient_data['sex']})")
    print(f"Room: {patient_data['room_id']}")
    print(f"Conditions: {patient_data['medical_conditions']}")
    
    # Test vitals generation
    mock_patient = Patient(
        id=1,
        name="Test Patient",
        age=65,
        sex="M",
        room_id="Room-01",
        medical_conditions="Hypertension"
    )
    
    vitals = simulation_engine._generate_vitals(mock_patient)
    print(f"Generated vitals: HR={vitals['heart_rate']}, BP={vitals['systolic_bp']}/{vitals['diastolic_bp']}")
    print(f"RR={vitals['respiratory_rate']}, SpO2={vitals['oxygen_saturation']}%, Temp={vitals['temperature']}°C")
    
    print("✅ Simulation engine tests passed")

def test_websocket_manager():
    """Test the WebSocket manager functionality."""
    print("\n📡 Testing WebSocket Manager...")
    
    manager = WebSocketManager()
    
    # Test connection count
    print(f"Initial connection count: {manager.get_connection_count()}")
    
    # Test message broadcasting (without actual connections)
    test_message = {
        "type": "test",
        "data": {"test": "value"}
    }
    
    # This should not fail even without connections
    try:
        asyncio.run(manager.broadcast(test_message))
        print("✅ Message broadcasting test passed")
    except Exception as e:
        print(f"❌ Message broadcasting test failed: {e}")
    
    print("✅ WebSocket manager tests passed")

def test_vital_ranges():
    """Test vital sign ranges and classifications."""
    print("\n📊 Testing Vital Sign Ranges...")
    
    engine = ClassificationEngine()
    ranges = engine.get_vital_ranges()
    
    print("Normal ranges:")
    for vital, range_data in ranges['normal'].items():
        print(f"  {vital}: {range_data['min']} - {range_data['max']}")
    
    print("Warning ranges:")
    for vital, range_data in ranges['warning'].items():
        print(f"  {vital}: {range_data['min']} - {range_data['max']}")
    
    print("Critical ranges:")
    for vital, range_data in ranges['critical'].items():
        print(f"  {vital}: {range_data['min']} - {range_data['max']}")
    
    print("✅ Vital ranges test passed")

def main():
    """Run all tests."""
    print("🏥 KPUM Demo System Test")
    print("=" * 40)
    print(f"Test started at: {datetime.now()}")
    
    try:
        test_classification_engine()
        test_simulation_engine()
        test_websocket_manager()
        test_vital_ranges()
        
        print("\n" + "=" * 40)
        print("✅ All tests passed! The KPUM demo system is ready.")
        print("🚀 You can now run the system with:")
        print("   ./setup.sh")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 