import api from './api';

export interface Notification {
    id: string;
    message: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    channel: 'IN_APP' | 'EMAIL' | 'SMS';
    status: 'PENDING' | 'SENT' | 'FAILED' | 'READ';
    createdAt: string;
    readAt?: string;
}

export const getNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

export const markAsRead = async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
};
