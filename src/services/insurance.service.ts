import api from './api';

export const InsuranceService = {
  async getPendingVerifications() {
    const response = await api.get('/insurance/verification/pending');
    return response.data;
  },

  async getPatientInsurance(patientId: string) {
    const response = await api.get(`/insurance/verification/patient/${patientId}`);
    return response.data;
  },

  async approveInsurance(id: string, data: { annualLimit?: number; coveragePercentage?: number; validFrom?: string; validUntil?: string; verificationNote?: string }) {
    const response = await api.post(`/insurance/verification/${id}/approve`, data);
    return response.data;
  },

  async rejectInsurance(id: string, verificationNote?: string) {
    const response = await api.post(`/insurance/verification/${id}/reject`, { verificationNote });
    return response.data;
  },

  async getVerificationStats() {
    const response = await api.get('/insurance/verification/stats');
    return response.data;
  },

  async getProviders() {
    const response = await api.get('/insurance/providers');
    return response.data;
  }
};
