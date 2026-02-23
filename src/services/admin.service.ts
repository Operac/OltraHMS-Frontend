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

    updateStaffHRDetails: async (staffId: string, data: any) => {
        const response = await api.put(`/admin/staff/${staffId}/hr-details`, data);
        return response.data;
    },

    // Leave Management
    getAllLeaves: async (status?: string) => {
        const response = await api.get('/leaves', { params: { status } });
        return response.data;
    },

    updateLeaveStatus: async (id: string, status: string) => {
        const response = await api.patch(`/leaves/${id}/status`, { status });
        return response.data;
    },

    getConflictingLeaves: async (id: string) => {
        const response = await api.get(`/leaves/${id}/conflicts`);
        return response.data;
    },

    // Leave Types & Settings
    getLeaveTypes: async () => {
        const response = await api.get('/leaves/types');
        return response.data;
    },

    createLeaveType: async (data: any) => {
        const response = await api.post('/leaves/types', data);
        return response.data;
    },

    updateLeaveType: async (id: string, data: any) => {
        const response = await api.patch(`/leaves/types/${id}`, data);
        return response.data;
    },

    deleteLeaveType: async (id: string) => {
        const response = await api.delete(`/leaves/types/${id}`);
        return response.data;
    },

    // Staff Leave Balances
    getStaffBalances: async (staffId: string) => {
        const response = await api.get(`/leaves/balances/${staffId}`);
        return response.data;
    },

    updateStaffBalance: async (staffId: string, leaveTypeId: string, allocatedDays: number) => {
        const response = await api.put(`/leaves/balances/${staffId}/${leaveTypeId}`, { allocatedDays });
        return response.data;
    },

    // Payroll Management
    getPayrolls: async (month?: string, year?: string) => {
        const response = await api.get('/payroll', { params: { month, year } });
        return response.data;
    },

    generatePayroll: async (month: string, year: string) => {
        const response = await api.post('/payroll/generate', { month, year });
        return response.data;
    },

    markPayrollPaid: async (id: string) => {
        const response = await api.patch(`/payroll/${id}/pay`);
        return response.data;
    },

    // Audit Logs
    getAuditLogs: async () => {
        const response = await api.get('/admin/audit-logs');
        return response.data;
    },
};
