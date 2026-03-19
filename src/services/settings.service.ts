import api from './api';

export interface HospitalSettings {
  id: string;
  currencyCode: string;
  currencySymbol: string;
  timeSlotDuration: number; // in minutes (default 30)
  mondayOpen: string;
  mondayClose: string;
  mondayIsOpen: boolean;
  tuesdayOpen: string;
  tuesdayClose: string;
  tuesdayIsOpen: boolean;
  wednesdayOpen: string;
  wednesdayClose: string;
  wednesdayIsOpen: boolean;
  thursdayOpen: string;
  thursdayClose: string;
  thursdayIsOpen: boolean;
  fridayOpen: string;
  fridayClose: string;
  fridayIsOpen: boolean;
  saturdayOpen: string;
  saturdayClose: string;
  saturdayIsOpen: boolean;
  sundayOpen: string;
  sundayClose: string;
  sundayIsOpen: boolean;
  telemedicineEnabled: boolean;
  telemedicineStart: string;
  telemedicineEnd: string;
  telemedicine24Hours: boolean;
}

export const SettingsService = {
  getHospitalSettings: async (): Promise<HospitalSettings> => {
    const response = await api.get<HospitalSettings>('/settings/hospital');
    return response.data;
  },

  updateHospitalSettings: async (data: Partial<HospitalSettings>): Promise<HospitalSettings> => {
    const response = await api.put<HospitalSettings>('/settings/hospital', data);
    return response.data;
  },
};

// Currency mapping for common currencies
export const CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

// Helper to get currency symbol
export const getCurrencySymbol = (code: string): string => {
  const currency = CURRENCIES.find(c => c.code === code);
  return currency?.symbol || '₦'; // Default to Nigerian Naira
};
