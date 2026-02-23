import api from '../lib/api';

export interface Department {
    id: string;
    name: string;
    description?: string;
    headOfDeptId?: string;
    headOfDept?: {
        user: {
            firstName: string;
            lastName: string;
        }
    };
    _count?: {
        staff: number;
    };
}

export const DepartmentService = {
    getAll: async () => {
        const response = await api.get<Department[]>('/departments');
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/departments', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/departments/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/departments/${id}`);
        return response.data;
    }
};
