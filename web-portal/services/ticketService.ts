import { API_CONFIG } from '@/lib/api-config';
import { authService } from './authService';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'plumbing' | 'electrical' | 'security' | 'noise' | 'cleaning' | 'landscaping' | 'other';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  location?: string;
  image_url?: string;
  display_image_url?: string;
  created_by_id: number;
  assigned_to_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface TicketCreate {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  location?: string;
  image_url?: string;
}

export const ticketService = {
  async getTickets(): Promise<Ticket[]> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/tickets/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }
    return response.json();
  },

  async createTicket(data: TicketCreate): Promise<Ticket> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/tickets/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create ticket');
    }
    return response.json();
  },

  async getTicket(id: number): Promise<Ticket> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/tickets/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ticket');
    }
    return response.json();
  },

  async updateTicket(id: number, data: Partial<TicketCreate> & { status?: TicketStatus }): Promise<Ticket> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/tickets/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update ticket');
    }
    return response.json();
  }
};
