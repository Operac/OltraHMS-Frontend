import api from './api';

export const HRService = {
    // Leave Management (Staff)
    getMyLeaves: async () => {
        const response = await api.get('/leaves/my');
        return response.data;
    },

    requestLeave: async (data: any) => {
        const response = await api.post('/leaves/request', data);
        return response.data;
    },

    getMyBalances: async () => {
        const response = await api.get('/leaves/my/balances');
        return response.data;
    },

    // Payroll (Staff)
    getMyPayrolls: async () => {
        const response = await api.get('/payroll/my');
        return response.data;
    }
};
