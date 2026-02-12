import api from './api';

export interface PatientRegistrationData {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    address?: string;
}

export interface AppointmentBookingData {
    patientId: string;
    doctorId: string;
    startTime: string;
    type?: string;
    notes?: string;
}

export const getDailyAppointments = async (filters?: { date?: string; doctorId?: string; status?: string }) => {
    const params = new URLSearchParams(filters as any);
    const response = await api.get(`/receptionist/appointments/daily?${params}`);
    return response.data;
};

export const checkInPatient = async (appointmentId: string) => {
    const response = await api.patch(`/receptionist/appointments/${appointmentId}/check-in`);
    return response.data;
};

export const markAppointmentNoShow = async (appointmentId: string) => {
    const response = await api.patch(`/receptionist/appointments/${appointmentId}/no-show`);
    return response.data;
};

export const registerPatient = async (data: PatientRegistrationData) => {
    const response = await api.post('/receptionist/patients', data);
    return response.data;
};

export const searchPatients = async (query: string) => {
    const response = await api.get(`/receptionist/patients/search?query=${query}`);
    return response.data;
};

export const bookAppointment = async (data: AppointmentBookingData) => {
    const response = await api.post('/receptionist/appointments', data);
    return response.data;
};

export const listDoctors = async () => {
    const response = await api.get('/receptionist/doctors');
    return response.data;
};
