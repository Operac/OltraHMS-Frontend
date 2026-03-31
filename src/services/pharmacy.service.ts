import api from './api';

export interface DispenseItem {
    medicationId: string;
    batchId: string;
    quantity: number;
}

export interface PurchaseOrder {
    medicationId: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    costPrice: number;
    supplier: string;
}

export const PharmacyService = {
    // Inventory
    getInventory: async () => {
        const response = await api.get('/inventory');
        return response.data;
    },

    receiveStock: async (data: PurchaseOrder) => {
        const response = await api.post('/inventory/receive', data);
        return response.data;
    },

    getLowStockAlerts: async () => {
        const response = await api.get('/inventory/alerts/low-stock');
        return response.data;
    },

    createMedication: async (data: any) => {
        const response = await api.post('/inventory/medications', data);
        return response.data;
    },

    // Pharmacy / Dispensing
    getQueue: async () => {
        const response = await api.get('/pharmacy/queue');
        return response.data;
    },

    getRefillRequests: async () => {
        const response = await api.get('/pharmacy/refill-requests');
        return response.data;
    },

    dispense: async (prescriptionId: string, items: DispenseItem[]) => {
        const response = await api.post(`/pharmacy/dispense/${prescriptionId}`, { items });
        return response.data;
    },

    createInvoice: async (prescriptionId: string) => {
        const response = await api.post('/pharmacy/invoice', { prescriptionId });
        return response.data;
    },

    getReport: async () => {
        const response = await api.get('/pharmacy/report');
        return response.data;
    },

    // Payment gate methods
    submitPayment: async (prescriptionId: string) => {
        const response = await api.post('/pharmacy/submit-payment', { prescriptionId });
        return response.data;
    },

    clearPayment: async (prescriptionId: string) => {
        const response = await api.post('/pharmacy/clear-payment', { prescriptionId });
        return response.data;
    },

    waivePayment: async (prescriptionId: string, waiverReason?: string) => {
        const response = await api.post('/pharmacy/waive-payment', { prescriptionId, waiverReason });
        return response.data;
    }
};
