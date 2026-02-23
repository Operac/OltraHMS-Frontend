
import axios from 'axios';
import type { InpatientData } from '../types/inpatient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const inpatientService = {
    // Nurse: MAR
    getScheduledMedications: async (patientId: string, date?: string): Promise<InpatientData> => {
        const response = await axios.get(`${API_URL}/inpatient/medications`, {
            params: { patientId, date },
            ...getHeaders()
        });
        return response.data;
    },

    logMedication: async (data: { 
        prescriptionId: string; 
        patientId: string; 
        status: string; 
        notes?: string;
        scheduledTime?: string;
    }) => {
        const response = await axios.post(`${API_URL}/inpatient/medications/log`, data, getHeaders());
        return response.data;
    },

    // Nurse: Fluids
    logFluid: async (data: {
        patientId: string;
        admissionId?: string;
        type: 'INTAKE' | 'OUTPUT';
        fluidType: string;
        amount: number;
    }) => {
        const response = await axios.post(`${API_URL}/inpatient/fluids`, data, getHeaders());
        return response.data;
    },

    getPatientCharts: async (patientId: string) => {
        const response = await axios.get(`${API_URL}/inpatient/charts/${patientId}`, getHeaders());
        return response.data;
    },

    // Doctor: Rounds
    addRoundNote: async (data: { admissionId: string; notes: string }) => {
        const response = await axios.post(`${API_URL}/inpatient/rounds`, data, getHeaders());
        return response.data;
    },

    getWardRounds: async (admissionId: string) => {
        const response = await axios.get(`${API_URL}/inpatient/rounds/${admissionId}`, getHeaders());
        return response.data;
    },

    createDepositInvoice: async (data: { admissionId: string; amount: number }) => {
        const response = await axios.post(`${API_URL}/inpatient/deposit`, data, getHeaders());
        return response.data;
    },

    // Ward Management (Proxied to Admission Routes)
    getAllWards: async () => {
        const response = await axios.get(`${API_URL}/admissions/beds`, getHeaders());
        // Map backend response to match dashboard expectations if needed
        // Backend returns Wards with Beds. Dashboard expects list of wards with stats.
        // We might need to transform it here or in the component.
        // Let's assume the component handles it or we transform it here.
        // The component expects ward.stats { occupied, total, available, dirty }
        // The backend `getBeds` returns standard Ward structure.
        // Let's transform it here to be safe, or just return it and let component fail if structure mismatch?
        // Component accesses `ward.stats.occupied`.
        // Backend `getBeds` returns `ward.beds`.
        // So we MUST transform.
        return response.data.map((ward: any) => {
            const total = ward.beds.length;
            const occupied = ward.beds.filter((b: any) => b.status === 'OCCUPIED').length;
            const dirty = ward.beds.filter((b: any) => b.status === 'VACANT_DIRTY').length;
            const available = ward.beds.filter((b: any) => b.status === 'VACANT_CLEAN').length;
            return {
                ...ward,
                stats: { total, occupied, dirty, available }
            };
        });
    },

    getWardDetails: async (wardId: string) => {
        const response = await axios.get(`${API_URL}/admissions/wards/${wardId}`, getHeaders());
        return response.data;
    },

    updateBedStatus: async (bedId: string, status: string) => {
        const response = await axios.patch(`${API_URL}/admissions/beds/${bedId}/status`, { status }, getHeaders());
        return response.data;
    },

    dischargePatient: async (admissionId: string) => {
        // WardDetails uses this service method
        const response = await axios.post(`${API_URL}/admissions/discharge/${admissionId}`, {}, getHeaders());
        return response.data;
    }
};
