import { API_CONFIG } from '@/lib/api-config';
import { authService } from './authService';

export interface Incident {
  id: number;
  title: string;
  description: string;
  location?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  reporter_id: number;
}

export const incidentService = {
  async getIncidents(params?: { startDate?: string; endDate?: string }): Promise<Incident[]> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);

    const response = await fetch(`${API_CONFIG.BASE_URL}/incidents/?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch incidents');
    }
    return response.json();
  },

  async triggerSOS(): Promise<Incident> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/incidents/sos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to trigger SOS');
    }
    return response.json();
  },

  async createIncident(data: { title: string; description: string; location?: string }): Promise<Incident> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/incidents/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to report incident');
    }
    return response.json();
  },

  async updateStatus(id: number, status: string): Promise<Incident> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/incidents/${id}/status?status=${status}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update incident status');
    }
    return response.json();
  }
};
