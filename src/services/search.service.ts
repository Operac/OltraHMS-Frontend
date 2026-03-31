import api from './api';

export interface SearchResult {
  id: string;
  type: 'patient' | 'staff' | 'appointment';
  name: string;
  subtitle?: string;
  path: string;
}

export const searchGlobal = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.length < 2) return [];

  try {
    const response = await api.get('/search', { params: { q: query } });
    return response.data;
  } catch (error) {
    // Fallback: try searching patients directly if no global search endpoint
    try {
      const patientsRes = await api.get('/patients', {
        params: { search: query, limit: 5 }
      });
      const staffRes = await api.get('/staff', {
        params: { search: query, limit: 5 }
      });

      const results: SearchResult[] = [];

      // Add patients
      if (patientsRes.data?.data) {
        patientsRes.data.data.forEach((p: any) => {
          results.push({
            id: p.id,
            type: 'patient',
            name: `${p.firstName} ${p.lastName}`,
            subtitle: `Patient • ${p.patientId || p.email}`,
            path: `/patients/${p.id}`
          });
        });
      }

      // Add staff
      if (staffRes.data?.data) {
        staffRes.data.data.forEach((s: any) => {
          results.push({
            id: s.id,
            type: 'staff',
            name: `${s.firstName} ${s.lastName}`,
            subtitle: `${s.role} • ${s.staffId || s.email}`,
            path: '/staff'
          });
        });
      }

      return results;
    } catch {
      return [];
    }
  }
};