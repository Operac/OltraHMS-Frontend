
import api from './api';

export interface MedicalRecord {
  id: string;
  diagnosis: string;
  notes: string;
  visitDate: string;
  doctor: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  expiresAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  total: number;       // Changed from amount to total to match usage
  balance: number;
  status: 'ISSUED' | 'PARTIAL' | 'PAID' | 'VOID' | 'REFUNDED' | 'OVERDUE';
  dueDate?: string;
  createdAt: string;   // Added
  medicalRecord?: {    // Added
      doctor?: {
          firstName: string;
          lastName: string;
      }
  };
  items: any[];
}

export interface WellnessGoal {
  id: string;
  description: string;
  status: string;
  targetDate?: string;
}

export interface Dependent {
    id: string;
    firstName: string;
    lastName: string;
    relation?: string;
}

export const PatientService = {
  // --- Profile ---
  getProfile: async () => {
    const response = await api.get('/patients/profile/me');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/patients/dashboard');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.patch('/patients/profile', data);
    return response.data;
  },

  // --- Medical Records ---
   getMedicalRecords: async () => {
     const response = await api.get('/patient-experience/medical-records');
     return response.data.history || response.data;
   },
   
   getLabResults: async () => {
     const response = await api.get('/patient-experience/lab-results');
     return response.data;
   },
 
   getPrescriptions: async () => {
     const response = await api.get('/patient-experience/prescriptions');
     return response.data;
   },
 
   getMedicationSchedule: async () => {
     const response = await api.get('/patient-experience/medications/adherence');
     return response.data;
   },
 
   requestRefill: async (prescriptionId: string) => {
     const response = await api.post(`/patient-experience/prescriptions/${prescriptionId}/refill`);
     return response.data;
   },
 
   // --- Billing ---
   getInvoices: async () => {
     const response = await api.get('/patient-experience/invoices');
     return response.data;
   },
 
   processPayment: async (data: { invoiceId: string; amount: number; method: string; reference?: string }) => {
     const response = await api.post('/patient-experience/payments/process', data);
     return response.data;
   },
 
   submitPayment: async (data: { invoiceId: string; method: string; reference?: string }) => {
     const response = await api.post('/patient-experience/payments/submit', data);
     return response.data;
   },
 
   // --- Telemedicine ---
   getQueueStatus: async () => {
     const response = await api.get('/patient-experience/queue-status');
     return response.data;
   },
 
   initializeVideoSession: async (appointmentId: string) => {
     const response = await api.post('/patient-experience/telemedicine/session', { appointmentId });
     return response.data;
   },
 
   // --- Family & Settings ---
   getDependents: async () => {
     const response = await api.get('/patient-experience/dependents');
     return response.data;
   },
 
   addDependent: async (data: any) => {
     const response = await api.post('/patient-experience/dependents', data);
     return response.data;
   },
 
   removeDependent: async (id: string) => {
     const response = await api.delete(`/patient-experience/dependents/${id}`);
     return response.data;
   },
 
   getEmergencyProfile: async () => {
     const response = await api.get('/patient-experience/emergency-profile');
     return response.data;
   },
 
   updateEmergencyProfile: async (data: any) => {
     const response = await api.put('/patient-experience/emergency-profile', data);
     return response.data;
   },
 
   // --- Wellness & Misc ---
   getWellnessGoals: async () => {
     const response = await api.get('/patient-experience/wellness/goals');
     return response.data;
   },
 
   updateWellnessGoal: async (id: string, data: any) => {
     const response = await api.post(`/patient-experience/wellness/goals`, { id, ...data });
     return response.data;
   },
   
   submitFeedback: async (data: any) => {
     const response = await api.post('/patient-experience/feedback', data);
     return response.data;
   },

  getAppointment: async (id: string) => {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
  },

  // --- Insurance ---
  getInsurancePolicies: async () => {
    const response = await api.get('/patient-experience/insurance');
    return response.data;
  },

  addInsurancePolicy: async (data: any) => {
    const response = await api.post('/patient-experience/insurance', data);
    return response.data;
  },

  updateInsurancePolicy: async (id: string, data: any) => {
    const response = await api.patch(`/patient-experience/insurance/${id}`, data);
    return response.data;
  },

  deleteInsurancePolicy: async (id: string) => {
    const response = await api.delete(`/patient-experience/insurance/${id}`);
    return response.data;
  }
};
