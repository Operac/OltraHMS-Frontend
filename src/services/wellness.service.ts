
import api from './api';

export interface WellnessGoal {
    id: string;
    description: string;
    category: string;
    frequency: string;
    targetValue: number;
    currentValue: number;
    unit?: string;
    streak: number;
    status: string;
    lastCheckedIn?: string;
}

export const wellnessService = {
    getGoals: async () => {
        const response = await api.get('/wellness');
        return response.data;
    },
    
    createGoal: async (data: Partial<WellnessGoal>) => {
        const response = await api.post('/wellness', data);
        return response.data;
    },
    
    checkIn: async (id: string, value: number) => {
        const response = await api.patch(`/wellness/${id}/checkin`, { value });
        return response.data;
    }
};
