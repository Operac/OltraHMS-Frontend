import api from './api';

export const InpatientService = {
    // Wards
    getAllWards: async () => {
        const response = await api.get('/inpatient/wards');
        return response.data;
    },

    getWardDetails: async (id: string) => {
        const response = await api.get(`/inpatient/wards/${id}`);
        return response.data;
    },

    // Beds
    updateBedStatus: async (bedId: string, status: string) => {
        const response = await api.patch(`/inpatient/beds/${bedId}/status`, { status });
        return response.data;
    },

    // Admissions
    admitPatient: async (data: { patientId: string, bedId: string, reason: string, estimatedDischargeDate?: string }) => {
        const response = await api.post('/inpatient/admit', data);
        return response.data;
    },

    dischargePatient: async (admissionId: string) => {
        const response = await api.post('/inpatient/discharge', { admissionId });
        return response.data;
    }
};
