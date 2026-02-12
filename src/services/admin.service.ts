import api from './api';

export const AdminService = {
    // Dashboard Stats
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // Staff Management
    getAllStaff: async () => {
        const response = await api.get('/admin/staff');
        return response.data;
    },

    createStaff: async (data: any) => {
        const response = await api.post('/admin/staff', data);
        return response.data;
    },

    updateStaffStatus: async (userId: string, status: string) => {
        const response = await api.patch(`/admin/staff/${userId}/status`, { status });
        return response.data;
    },

    // Audit Logs
    getAuditLogs: async () => {
        const response = await api.get('/admin/audit-logs');
        return response.data;
    },
};
