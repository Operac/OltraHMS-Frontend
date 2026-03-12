
import api from './api';

// Types
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
    createdAt?: string;
}

export interface WellnessVitals {
    id: string;
    type: string;
    value: number;
    value2?: number;
    unit: string;
    notes?: string;
    recordedAt: string;
}

export interface WellnessMedication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    times: string;
    instructions?: string;
    startDate: string;
    endDate?: string;
    status: string;
    logs?: MedicationLog[];
}

export interface MedicationLog {
    id: string;
    medicationId: string;
    scheduledTime: string;
    takenAt?: string;
    status: string;
    notes?: string;
}

export interface WellnessMood {
    id: string;
    moodScore: number;
    stressLevel?: number;
    energyLevel?: number;
    notes?: string;
    recordedAt: string;
}

export interface WellnessSleep {
    id: string;
    bedtime: string;
    wakeTime: string;
    quality?: number;
    duration?: number;
    notes?: string;
    recordedAt: string;
}

export interface WellnessSymptom {
    id: string;
    symptom: string;
    severity: number;
    frequency?: string;
    location?: string;
    triggers?: string;
    notes?: string;
    recordedAt: string;
}

export interface WellnessReminder {
    id: string;
    type: string;
    title: string;
    description?: string;
    time: string;
    frequency: string;
    daysOfWeek?: string;
    enabled: boolean;
}

export interface WellnessSummary {
    period: string;
    goals: {
        total: number;
        completed: number;
        inProgress: number;
        completionRate: number;
    };
    vitals: Record<string, WellnessVitals>;
    medications: {
        activeCount: number;
        adherence: number | null;
    };
    mood: {
        average: number | null;
        entries: number;
    };
    sleep: {
        averageDurationMinutes: number | null;
        entries: number;
    };
    symptoms: {
        total: number;
        severe: number;
    };
}

export const wellnessService = {
    // Goals (existing)
    getGoals: async () => {
        const response = await api.get('/wellness/goals');
        return response.data;
    },
    
    createGoal: async (data: Partial<WellnessGoal>) => {
        const response = await api.post('/wellness/goals', data);
        return response.data;
    },
    
    checkIn: async (id: string, value: number) => {
        const response = await api.patch(`/wellness/goals/${id}/checkin`, { value });
        return response.data;
    },

    // Vitals
    getVitals: async (type?: string) => {
        const params = type ? `?type=${type}` : '';
        const response = await api.get(`/wellness/vitals${params}`);
        return response.data;
    },

    recordVitals: async (data: Partial<WellnessVitals>) => {
        const response = await api.post('/wellness/vitals', data);
        return response.data;
    },

    deleteVitals: async (id: string) => {
        const response = await api.delete(`/wellness/vitals/${id}`);
        return response.data;
    },

    // Medications
    getMedications: async () => {
        const response = await api.get('/wellness/medications');
        return response.data;
    },

    addMedication: async (data: {
        name: string;
        dosage: string;
        frequency: string;
        times: string[];
        instructions?: string;
        startDate: string;
        endDate?: string;
    }) => {
        const response = await api.post('/wellness/medications', data);
        return response.data;
    },

    updateMedicationStatus: async (id: string, status: string) => {
        const response = await api.patch(`/wellness/medications/${id}/status`, { status });
        return response.data;
    },

    logMedication: async (medicationId: string, data: {
        status: string;
        takenAt?: string;
        notes?: string;
    }) => {
        const response = await api.post(`/wellness/medications/${medicationId}/log`, data);
        return response.data;
    },

    deleteMedication: async (id: string) => {
        const response = await api.delete(`/wellness/medications/${id}`);
        return response.data;
    },

    // Mood
    getMoods: async () => {
        const response = await api.get('/wellness/moods');
        return response.data;
    },

    recordMood: async (data: {
        moodScore: number;
        stressLevel?: number;
        energyLevel?: number;
        notes?: string;
    }) => {
        const response = await api.post('/wellness/moods', data);
        return response.data;
    },

    // Sleep
    getSleep: async () => {
        const response = await api.get('/wellness/sleep');
        return response.data;
    },

    recordSleep: async (data: {
        bedtime: string;
        wakeTime: string;
        quality?: number;
        notes?: string;
    }) => {
        const response = await api.post('/wellness/sleep', data);
        return response.data;
    },

    // Symptoms
    getSymptoms: async () => {
        const response = await api.get('/wellness/symptoms');
        return response.data;
    },

    recordSymptom: async (data: {
        symptom: string;
        severity: number;
        frequency?: string;
        location?: string;
        triggers?: string;
        notes?: string;
    }) => {
        const response = await api.post('/wellness/symptoms', data);
        return response.data;
    },

    // Reminders
    getReminders: async () => {
        const response = await api.get('/wellness/reminders');
        return response.data;
    },

    createReminder: async (data: {
        type: string;
        title: string;
        description?: string;
        time: string;
        frequency: string;
        daysOfWeek?: string[];
    }) => {
        const response = await api.post('/wellness/reminders', data);
        return response.data;
    },

    updateReminder: async (id: string, data: {
        enabled?: boolean;
        time?: string;
        title?: string;
        description?: string;
    }) => {
        const response = await api.patch(`/wellness/reminders/${id}`, data);
        return response.data;
    },

    deleteReminder: async (id: string) => {
        const response = await api.delete(`/wellness/reminders/${id}`);
        return response.data;
    },

    // Summary/Analytics
    getSummary: async () => {
        const response = await api.get('/wellness/summary');
        return response.data;
    },

    // Provider: Get patient wellness data
    getPatientWellness: async (patientId: string) => {
        const response = await api.get(`/wellness/patient/${patientId}`);
        return response.data;
    }
};
