export interface Patient {
  id: number;
  name: string;
  age: number;
  sex: string;
  room_id: string;
  medical_conditions?: string;
  admission_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vitals {
  id: number;
  patient_id: number;
  timestamp: string;
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  temperature: number;
  ekg_data?: string;
  status: 'normal' | 'watch' | 'critical';
  classification_reason?: string;
  recommended_action?: string;
}

export interface PatientVitals {
  patient_id: number;
  patient_name: string;
  room_id: string;
  vitals: {
    heart_rate: number;
    systolic_bp: number;
    diastolic_bp: number;
    respiratory_rate: number;
    oxygen_saturation: number;
    temperature: number;
    ekg_data?: string;
  };
  status: 'normal' | 'watch' | 'critical';
  reason?: string;
  recommended_action?: string;
}

export interface Treatment {
  id: number;
  patient_id: number;
  timestamp: string;
  treatment_type: string;
  treatment_description: string;
  prescribed_by: string;
  decision: string;
  notes?: string;
}

export interface Dispatch {
  id: number;
  patient_id: number;
  timestamp: string;
  dispatch_type: string;
  destination: string;
  estimated_eta?: string;
  priority: string;
  decision: string;
  reason: string;
  confirmed_by: string;
  notes?: string;
}

export interface WebSocketMessage {
  type: 'vitals_update' | 'status_change' | 'treatment_decision' | 'dispatch_decision';
  timestamp: string;
  data?: any;
  patient_id?: number;
  status?: string;
  reason?: string;
}

export interface SystemStatus {
  status: string;
  patients_count: number;
  active_connections: number;
  simulation_started: boolean;
  last_update: string;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting'; 