import api from './api';

export interface LabOrder {
    id: string;
    testName: string;
    priority: 'ROUTINE' | 'URGENT' | 'STAT';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    orderedAt: string;
    clinicalIndication?: string;
    patient: {
        firstName: string;
        lastName: string;
        patientNumber: string;
    };
    medicalRecord: {
        doctor: {
            user: {
                firstName: string;
                lastName: string;
            }
        }
    };
}

export const labService = {
    getPendingOrders: async (): Promise<LabOrder[]> => {
        const response = await api.get('/labs/orders/pending');
        return response.data;
    },

    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/labs/orders/${id}/status`, { status });
        return response.data;
    },

    uploadResult: async (id: string, formData: FormData) => {
        const response = await api.post(`/labs/orders/${id}/result`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
