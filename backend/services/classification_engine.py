import logging
from typing import Dict, Any, Tuple
import random

logger = logging.getLogger(__name__)

class ClassificationEngine:
    def __init__(self):
        # Normal ranges for vital signs
        self.normal_ranges = {
            "heart_rate": {"min": 60, "max": 100},
            "systolic_bp": {"min": 90, "max": 140},
            "diastolic_bp": {"min": 60, "max": 90},
            "respiratory_rate": {"min": 12, "max": 20},
            "oxygen_saturation": {"min": 95, "max": 100},
            "temperature": {"min": 36.5, "max": 37.5}
        }
        
        # Warning ranges (watch status)
        self.warning_ranges = {
            "heart_rate": {"min": 50, "max": 110},
            "systolic_bp": {"min": 80, "max": 160},
            "diastolic_bp": {"min": 50, "max": 100},
            "respiratory_rate": {"min": 10, "max": 25},
            "oxygen_saturation": {"min": 90, "max": 100},
            "temperature": {"min": 36.0, "max": 38.0}
        }
        
        # Critical ranges
        self.critical_ranges = {
            "heart_rate": {"min": 40, "max": 120},
            "systolic_bp": {"min": 70, "max": 180},
            "diastolic_bp": {"min": 40, "max": 110},
            "respiratory_rate": {"min": 8, "max": 30},
            "oxygen_saturation": {"min": 85, "max": 100},
            "temperature": {"min": 35.5, "max": 38.5}
        }
    
    def classify_vitals(self, vitals: Dict[str, float]) -> Tuple[str, str, str]:
        """
        Classify patient vitals into status categories
        
        Returns:
            Tuple of (status, reason, recommended_action)
        """
        critical_vitals = []
        warning_vitals = []
        
        # Check each vital sign
        for vital_name, value in vitals.items():
            if vital_name == "ekg_data":
                continue  # Skip EKG data for now
                
            if vital_name in self.critical_ranges:
                range_data = self.critical_ranges[vital_name]
                if value < range_data["min"] or value > range_data["max"]:
                    critical_vitals.append((vital_name, value, range_data))
                elif vital_name in self.warning_ranges:
                    warning_range = self.warning_ranges[vital_name]
                    if value < warning_range["min"] or value > warning_range["max"]:
                        warning_vitals.append((vital_name, value, warning_range))
            elif vital_name in self.warning_ranges:
                warning_range = self.warning_ranges[vital_name]
                if value < warning_range["min"] or value > warning_range["max"]:
                    warning_vitals.append((vital_name, value, warning_range))
        

        
        # Determine status based on critical and warning vitals
        if len(critical_vitals) >= 2 or self._has_critical_ekg(vitals.get("ekg_data")):
            status = "critical"
            reason = self._generate_critical_reason(critical_vitals)
            recommended_action = self._generate_critical_action(critical_vitals)
        elif len(critical_vitals) == 1 or len(warning_vitals) >= 2:
            status = "watch"
            reason = self._generate_watch_reason(warning_vitals, critical_vitals)
            recommended_action = self._generate_watch_action(warning_vitals, critical_vitals)
        else:
            status = "normal"
            reason = "All vital signs within normal ranges"
            recommended_action = "Continue monitoring"
        
        return status, reason, recommended_action
    
    def _has_critical_ekg(self, ekg_data: str) -> bool:
        """Check if EKG data indicates critical condition"""
        if not ekg_data:
            return False
        
        # Simple EKG analysis - in a real system this would be more sophisticated
        try:
            ekg_values = [float(x) for x in ekg_data.split(",")]
            # Check for arrhythmia patterns
            if len(ekg_values) > 10:
                # Simple arrhythmia detection
                variations = [abs(ekg_values[i] - ekg_values[i-1]) for i in range(1, len(ekg_values))]
                if max(variations) > 2.0:  # High variation indicates arrhythmia
                    return True
        except:
            pass
        
        return False
    
    def _generate_critical_reason(self, critical_vitals: list) -> str:
        """Generate human-readable reason for critical status"""
        if not critical_vitals:
            return "Critical EKG pattern detected"
        
        vital_names = [v[0] for v in critical_vitals]
        if len(vital_names) == 1:
            vital_name = vital_names[0].replace("_", " ").title()
            return f"Critical {vital_name} detected"
        else:
            return f"Multiple critical vitals: {', '.join(vital_names)}"
    
    def _generate_watch_reason(self, warning_vitals: list, critical_vitals: list) -> str:
        """Generate human-readable reason for watch status"""
        all_vitals = warning_vitals + critical_vitals
        vital_names = [v[0].replace("_", " ").title() for v in all_vitals]
        return f"Abnormal vitals detected: {', '.join(vital_names)}"
    
    def _generate_critical_action(self, critical_vitals: list) -> str:
        """Generate recommended action for critical status"""
        if not critical_vitals:
            return "IMMEDIATE: STEMI suspected - Dispatch cardiac team, prepare for PCI"
        
        vital_names = [v[0] for v in critical_vitals]
        if "oxygen_saturation" in vital_names and "respiratory_rate" in vital_names:
            return "IMMEDIATE: Respiratory failure - Prepare for intubation, call respiratory therapy"
        elif "heart_rate" in vital_names:
            return "IMMEDIATE: Cardiac arrest - Prepare for defibrillation, call code blue"
        elif "systolic_bp" in vital_names or "diastolic_bp" in vital_names:
            return "IMMEDIATE: Hypertensive crisis - Administer IV antihypertensives, call cardiology"
        else:
            return "IMMEDIATE: Multiple critical vitals - Prepare for emergency intervention, call rapid response"
    
    def _generate_watch_action(self, warning_vitals: list, critical_vitals: list) -> str:
        """Generate recommended action for watch status"""
        all_vitals = warning_vitals + critical_vitals
        vital_names = [v[0] for v in all_vitals]
        
        actions = []
        if "oxygen_saturation" in vital_names:
            actions.append("Administer supplemental oxygen via nasal cannula")
        if "heart_rate" in vital_names:
            actions.append("Monitor cardiac rhythm, consider beta-blockers")
        if "systolic_bp" in vital_names or "diastolic_bp" in vital_names:
            actions.append("Check blood pressure manually, consider antihypertensives")
        if "temperature" in vital_names:
            actions.append("Monitor for fever/infection, consider antibiotics")
        if "respiratory_rate" in vital_names:
            actions.append("Assess respiratory effort, consider bronchodilators")
        
        if actions:
            return " | ".join(actions)
        else:
            return "Increase monitoring frequency to every 15 minutes"
    
    def get_vital_ranges(self) -> Dict[str, Dict[str, Dict[str, float]]]:
        """Get all vital sign ranges for frontend display"""
        return {
            "normal": self.normal_ranges,
            "warning": self.warning_ranges,
            "critical": self.critical_ranges
        } 