import api from '../lib/api';

export const ReportService = {
    getFinancialStats: async () => {
        const response = await api.get('/reports/finance');
        return response.data;
    },

    getPatientStats: async () => {
        const response = await api.get('/reports/patients');
        return response.data;
    },

    getInventoryStats: async () => {
        const response = await api.get('/reports/inventory');
        return response.data;
    }
};
