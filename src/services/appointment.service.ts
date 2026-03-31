import api from './api';

export interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    type: string;
    status: string;
    reason?: string;
    paymentStatus?: 'AWAITING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'CLEARED' | 'WAIVED';
    clearedAt?: string;
    waiverReason?: string;
    patient?: {
        firstName: string;
        lastName: string;
        patientNumber: string;
    };
    doctor?: {
        user: {
            firstName: string;
            lastName: string;
        };
    };
}

export const AppointmentService = {
    getById: async (id: string): Promise<Appointment> => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },

    getAll: async (params?: Record<string, string>): Promise<Appointment[]> => {
        const response = await api.get('/appointments', { params });
        return response.data;
    },

    create: async (data: {
        doctorId: string;
        startTime: string;
        endTime: string;
        type: string;
        reason?: string;
        patientId?: string;
    }): Promise<Appointment> => {
        const response = await api.post('/appointments', data);
        return response.data;
    },

    updateStatus: async (id: string, status: string): Promise<Appointment> => {
        const response = await api.patch(`/appointments/${id}/status`, { status });
        return response.data;
    },

    reschedule: async (id: string, data: { startTime: string; endTime: string }): Promise<Appointment> => {
        const response = await api.patch(`/appointments/${id}/reschedule`, data);
        return response.data;
    },

    // Payment gate methods
    submitPayment: async (id: string) => {
        const response = await api.post(`/appointments/${id}/submit-payment`);
        return response.data;
    },

    clearPayment: async (id: string) => {
        const response = await api.post(`/appointments/${id}/clear-payment`);
        return response.data;
    },

    waivePayment: async (id: string, waiverReason?: string) => {
        const response = await api.post(`/appointments/${id}/waive-payment`, { waiverReason });
        return response.data;
    }
};
