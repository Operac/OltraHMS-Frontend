
import api from './api';

export interface RadiologyTest {
    id: string;
    name: string;
    code: string;
    price: number;
    modality: string;
    description?: string;
}

export interface RadiologyRequest {
    id: string;
    patientId: string;
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        patientNumber?: string;
        dateOfBirth?: string;
        gender?: string;
    };
    testId: string;
    test: RadiologyTest;
    doctorId: string;
    doctor?: {
        firstName: string;
        lastName: string;
        user?: { // If nested from backend
            firstName: string;
            lastName: string;
        }
    };
    doctorName?: string; // Flattened
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    priority: 'ROUTINE' | 'URGENT' | 'STAT';
    notes?: string;
    report?: RadiologyReport;
    createdAt: string;
}

export interface RadiologyReport {
    id: string;
    requestId: string;
    radiologistId: string;
    findings: string;
    impression: string;
    imageUrls: string[];
    createdAt: string;
}

export const radiologyService = {
    getTests: async () => {
        const response = await api.get<RadiologyTest[]>('/radiology/tests');
        return response.data;
    },

    createRequest: async (data: { patientId: string; testId: string; priority: string; notes?: string }) => {
        const response = await api.post<RadiologyRequest>('/radiology/requests', data);
        return response.data;
    },

    getRequests: async (filters?: { status?: string; patientId?: string }) => {
        const response = await api.get<RadiologyRequest[]>('/radiology/requests', { params: filters });
        return response.data;
    },

    addReport: async (requestId: string, formData: FormData) => {
        // FormData should contain 'findings', 'impression', and 'images' (files)
        const response = await api.post<RadiologyReport>(`/radiology/requests/${requestId}/report`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
