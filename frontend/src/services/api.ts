import axios from 'axios';
import { Patient, Vitals, Treatment, Dispatch, SystemStatus } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const patientApi = {
  getAll: async (): Promise<Patient[]> => {
    const response = await api.get('/api/patients');
    return response.data;
  },

  getById: async (id: number): Promise<Patient> => {
    const response = await api.get(`/api/patients/${id}`);
    return response.data;
  },

  create: async (patient: Partial<Patient>): Promise<Patient> => {
    const response = await api.post('/api/patients', patient);
    return response.data;
  },
};

export const vitalsApi = {
  getByPatientId: async (patientId: number, limit: number = 100): Promise<Vitals[]> => {
    const response = await api.get(`/api/patients/${patientId}/vitals?limit=${limit}`);
    return response.data;
  },

  getLatest: async (): Promise<Record<number, Vitals>> => {
    const response = await api.get('/api/vitals/latest');
    return response.data;
  },
};

export const treatmentApi = {
  create: async (treatment: Partial<Treatment>): Promise<Treatment> => {
    const response = await api.post('/api/treatments', treatment);
    return response.data;
  },

  getByPatientId: async (patientId: number): Promise<Treatment[]> => {
    const response = await api.get(`/api/patients/${patientId}/treatments`);
    return response.data;
  },
};

export const dispatchApi = {
  create: async (dispatch: Partial<Dispatch>): Promise<Dispatch> => {
    const response = await api.post('/api/dispatches', dispatch);
    return response.data;
  },

  getAll: async (): Promise<Dispatch[]> => {
    const response = await api.get('/api/dispatches');
    return response.data;
  },
};

export const systemApi = {
  getStatus: async (): Promise<SystemStatus> => {
    const response = await api.get('/api/status');
    return response.data;
  },

  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api; 