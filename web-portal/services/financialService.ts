import { API_CONFIG } from '@/lib/api-config';
import { authService } from './authService';

export interface FeeDefinition {
  id: number;
  name: string;
  description?: string;
  amount: number;
  is_active: boolean;
  created_at: string;
}

export interface Payment {
  id: number;
  user_id: number;
  bill_id?: number;
  amount: number;
  method: 'cash' | 'ecocash' | 'onemoney' | 'zipit' | 'other';
  reference?: string;
  notes?: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  user?: {
    full_name: string;
    house_address?: string;
  };
  bill?: Bill;
}

export interface Bill {
  id: number;
  resident_id: number;
  amount: number;
  description: string;
  due_date: string;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  created_at: string;
  payments?: Payment[];
  resident?: {
    full_name: string;
    house_address?: string;
  };
}

export const financialService = {
  // Fee Definitions
  async getFeeDefinitions(): Promise<FeeDefinition[]> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/financial/fees`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch fee definitions');
    return response.json();
  },

  async createFeeDefinition(data: { name: string; description?: string; amount: number; is_active?: boolean }): Promise<FeeDefinition> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/financial/fees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create fee definition');
    return response.json();
  },

  async updateFeeDefinition(id: number, data: Partial<FeeDefinition>): Promise<FeeDefinition> {
      const token = authService.getToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_CONFIG.BASE_URL}/financial/fees/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update fee definition');
      return response.json();
  },

  async deleteFeeDefinition(id: number): Promise<void> {
      const token = authService.getToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/financial/fees/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete fee definition');
  },

  // Bills
  async getBills(): Promise<Bill[]> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/financial/bills`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bills');
    }
    return response.json();
  },

  async createBill(data: { resident_id: number; amount: number; description: string; due_date: string }): Promise<Bill> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/financial/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create bill');
    }
    return response.json();
  },

  // Payments
  async getPayments(params?: { startDate?: string; endDate?: string }): Promise<Payment[]> {
      const token = authService.getToken();
      if (!token) throw new Error('No authentication token');
  
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('start_date', params.startDate);
      if (params?.endDate) queryParams.append('end_date', params.endDate);

      const response = await fetch(`${API_CONFIG.BASE_URL}/financial/payments?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      return response.json();
  },

  async createPayment(data: { bill_id?: number; amount: number; method: string; reference?: string; notes?: string }): Promise<Payment> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/financial/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to record payment');
    }
    return response.json();
  },

  async updatePaymentStatus(id: number, status: 'verified' | 'rejected'): Promise<Payment> {
      const token = authService.getToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_CONFIG.BASE_URL}/financial/payments/${id}/status?status=${status}`, {
          method: 'PUT',
          headers: {
              'Authorization': `Bearer ${token}`,
          }
      });
      if (!response.ok) throw new Error('Failed to update payment status');
      return response.json();
  }
};
