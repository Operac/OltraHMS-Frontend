import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const queueService = {
    // Get all queues (for reception overview)
    getAllQueues: async (date?: string) => {
        const params = date ? `?date=${date}` : '';
        const response = await axios.get(`${API_URL}/queue${params}`, getHeaders());
        return response.data;
    },

    // Get queue for specific doctor
    getDoctorQueue: async (doctorId: string, date?: string) => {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        params.append('doctorId', doctorId);
        
        const response = await axios.get(`${API_URL}/queue/doctor/${doctorId}?${params}`, getHeaders());
        return response.data;
    },

    // Get available doctors for walk-in assignment
    getAvailableDoctors: async (departmentId?: string) => {
        const params = departmentId ? `?departmentId=${departmentId}` : '';
        const response = await axios.get(`${API_URL}/queue/doctors/available${params}`, getHeaders());
        return response.data;
    },

    // Check in a patient
    checkInPatient: async (appointmentId: string, priority?: 'normal' | 'emergency') => {
        const response = await axios.post(`${API_URL}/queue/checkin`, 
            { appointmentId, priority },
            getHeaders()
        );
        return response.data;
    },

    // Add walk-in patient
    addWalkIn: async (data: {
        patientId: string;
        doctorId?: string;
        departmentId?: string;
        reason?: string;
        priority?: 'normal' | 'emergency';
    }) => {
        const response = await axios.post(`${API_URL}/queue/walkin`, data, getHeaders());
        return response.data;
    },

    // Call next patient
    callNextPatient: async (doctorId: string) => {
        const response = await axios.post(`${API_URL}/queue/call-next`, { doctorId }, getHeaders());
        return response.data;
    },

    // Reassign patient to another doctor
    reassignPatient: async (appointmentId: string, newDoctorId: string, reason?: string) => {
        const response = await axios.post(`${API_URL}/queue/reassign`, 
            { appointmentId, newDoctorId, reason },
            getHeaders()
        );
        return response.data;
    },

    // Update queue position (manual reorder)
    updateQueuePosition: async (appointmentId: string, newPosition: number) => {
        const response = await axios.post(`${API_URL}/queue/reorder`, 
            { appointmentId, newPosition },
            getHeaders()
        );
        return response.data;
    },

    // Cancel check-in (remove from queue)
    cancelCheckIn: async (appointmentId: string) => {
        const response = await axios.delete(`${API_URL}/queue/${appointmentId}/checkin`, getHeaders());
        return response.data;
    }
};
