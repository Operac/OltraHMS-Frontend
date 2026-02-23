import api from './api';

export interface Ward {
  id: string;
  name: string;
  type: string;
  capacity: number;
  basePrice: number;
  beds: Bed[];
  createdAt: string;
  updatedAt: string;
}

export interface Bed {
  id: string;
  number: string;
  type: string | null;
  wardId: string;
  status: string;
  price: number | null;
  createdAt: string;
  updatedAt: string;
}

export const getWards = async () => {
  const response = await api.get('/wards');
  return response.data;
};

export const createWard = async (data: { name: string; type: string; capacity: number; basePrice?: number }) => {
  const response = await api.post('/wards', data);
  return response.data;
};

export const deleteWard = async (id: string) => {
  const response = await api.delete(`/wards/${id}`);
  return response.data;
};

export const createBed = async (data: { wardId: string; number: string; type?: string; price?: number }) => {
  const response = await api.post('/wards/beds', data);
  return response.data;
};

export const deleteBed = async (id: string) => {
  const response = await api.delete(`/wards/beds/${id}`);
  return response.data;
};
