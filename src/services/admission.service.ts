import api from '../lib/api';

export const AdmissionService = {
  getBeds: async () => {
    const response = await api.get('/admissions/beds');
    return response.data;
  },

  admitPatient: async (data: { patientId: string; wardId: string; bedId?: string; reason: string; estimatedDuration?: number }) => {
    const response = await api.post('/admissions/admit', data);
    return response.data;
  },

  dischargePatient: async (admissionId: string) => {
    const response = await api.post(`/admissions/discharge/${admissionId}`);
    return response.data;
  }
};
