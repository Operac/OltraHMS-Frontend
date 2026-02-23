import api from '../lib/api';

export const FinanceService = {
  getPendingInvoices: async () => {
    const response = await api.get('/finance/invoices');
    return response.data;
  },

  processPayment: async (data: { invoiceId: string; amount: number; method: string; reference?: string }) => {
    const response = await api.post('/finance/pay', data);
    return response.data;
  },

  // Services (Price List)
  getServices: async (params?: { type?: string; isExternal?: boolean }) => {
    const response = await api.get('/finance/services', { params });
    return response.data;
  },

  createService: async (data: any) => {
    const response = await api.post('/finance/services', data);
    return response.data;
  },

  updateService: async (id: string, data: any) => {
    const response = await api.patch(`/finance/services/${id}`, data);
    return response.data;
  },

  deleteService: async (id: string) => {
    const response = await api.delete(`/finance/services/${id}`);
    return response.data;
  },

  // Expenses
  addExpense: async (data: any) => {
    const response = await api.post('/finance/expenses', data);
    return response.data;
  },

  getExpenses: async (params?: { startDate?: string; endDate?: string; category?: string }) => {
    const response = await api.get('/finance/expenses', { params });
    return response.data;
  },

  getProfitLoss: async () => {
    const response = await api.get('/finance/reports/profit-loss');
    return response.data;
  }
};
