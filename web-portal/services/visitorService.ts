import { API_CONFIG } from '@/lib/api-config';
import { authService } from './authService';

export interface Visitor {
  id: number;
  full_name: string;
  phone_number: string;
  vehicle_number?: string;
  purpose?: string;
  expected_arrival?: string;
  host_id: number;
  status: 'pending' | 'approved' | 'checked_in' | 'checked_out' | 'denied';
  access_code: string;
  created_at: string;
  check_in_time?: string;
  check_out_time?: string;
}

export interface VisitorCreate {
  full_name: string;
  phone_number: string;
  vehicle_number?: string;
  purpose?: string;
  expected_arrival?: string;
  host_id?: number; // Optional now, inferred from token
}

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const visitorService = {
  async getAllVisitors(): Promise<Visitor[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/visitors/`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch all visitors');
    }
    return response.json();
  },

  async getMyVisitors(): Promise<Visitor[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/visitors/me`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch my visitors');
    }
    return response.json();
  },

  async getVisitorsByHost(hostId: number): Promise<Visitor[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/visitors/host/${hostId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch visitors');
    }
    return response.json();
  },

  async createVisitor(visitor: VisitorCreate): Promise<Visitor> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/visitors/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(visitor),
    });
    if (!response.ok) {
      throw new Error('Failed to create visitor');
    }
    return response.json();
  },

  async getVisitorDetails(visitorId: number): Promise<Visitor> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/visitors/${visitorId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch visitor details');
    }
    return response.json();
  },

  async getVisitorByAccessCode(accessCode: string): Promise<Visitor> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/visitors/code/${accessCode}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Visitor not found');
      }
      throw new Error('Failed to fetch visitor details');
    }
    return response.json();
  },

  async checkInVisitor(visitorId: number): Promise<Visitor> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/visitors/${visitorId}/check-in`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to check in visitor');
    }
    return response.json();
  },

  async checkOutVisitor(visitorId: number): Promise<Visitor> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/visitors/${visitorId}/check-out`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to check out visitor');
    }
    return response.json();
  }
};
