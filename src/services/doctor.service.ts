import api from './api';

export interface DashboardStats {
    totalToday: number;
    waiting: number;
    inProgress: number;
    completed: number;
    nextPatient: any | null; // Typed loosely for now, refine later
}

// Stats & Queue
export const getDashboardStats = async () => {
    const response = await api.get('/doctor/dashboard/stats'); 
    return response.data;
};

export const updateAppointmentStatus = async (id: string, status: string) => {
    const response = await api.patch(`/doctor/appointments/${id}/status`, { status });
    return response.data;
};

// Consultation & History
export const getPatientHistory = async (patientId: string) => {
    const response = await api.get(`/doctor/patients/${patientId}/history`);
    return response.data;
};

export const saveConsultation = async (data: any) => {
    const response = await api.post('/doctor/consultation', data);
    return response.data;
};
