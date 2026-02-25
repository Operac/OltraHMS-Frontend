
import api from './api';

export interface OperatingTheater {
    id: string;
    name: string;
    type: string;
    status: 'AVAILABLE' | 'MAINTENANCE' | 'IN_USE';
}

export interface SurgeryCase {
    id: string;
    patientId: string;
    patient: {
        firstName: string;
        lastName: string;
        patientNumber: string;
        gender: string;
        dateOfBirth: string;
    };
    leadSurgeonId: string;
    leadSurgeon: {
        user: {
            firstName: string;
            lastName: string;
        }
    };
    theaterId: string;
    theater: OperatingTheater;
    scheduledStart: string;
    scheduledEnd: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'RECOVERY' | 'COMPLETED' | 'CANCELLED';
    priority: 'ELECTIVE' | 'EMERGENCY';
    preOpDiagnosis?: string;
    postOpDiagnosis?: string;
    notes?: string;
}

export const surgeryService = {
    getTheaters: async () => {
        const response = await api.get<OperatingTheater[]>('/surgery/theaters');
        return response.data;
    },

    createTheater: async (data: Partial<OperatingTheater>) => {
        const response = await api.post<OperatingTheater>('/surgery/theaters', data);
        return response.data;
    },

    updateTheater: async (id: string, data: Partial<OperatingTheater>) => {
        const response = await api.patch<OperatingTheater>(`/surgery/theaters/${id}`, data);
        return response.data;
    },

    getSurgeons: async () => {
        const response = await api.get<any[]>('/receptionist/doctors');
        return response.data;
    },

    scheduleSurgery: async (data: any) => {
        const response = await api.post<SurgeryCase>('/surgery/cases', data);
        return response.data;
    },

    getSchedule: async (filters?: { date?: string; theaterId?: string }) => {
        const response = await api.get<SurgeryCase[]>('/surgery/cases', { params: filters });
        return response.data;
    },

    updateStatus: async (id: string, data: { status: string; postOpDiagnosis?: string; notes?: string }) => {
        const response = await api.patch<SurgeryCase>(`/surgery/cases/${id}/status`, data);
        return response.data;
    }
};
