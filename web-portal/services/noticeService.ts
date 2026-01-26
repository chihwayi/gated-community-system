import { API_CONFIG } from '@/lib/api-config';
import { authService } from './authService';

export interface Notice {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  expiry_date?: string;
  author_id: number;
}

export const noticeService = {
  async getNotices(): Promise<Notice[]> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/notices/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notices');
    }
    return response.json();
  },

  async createNotice(data: { title: string; content: string; priority: string; expiry_date?: string }): Promise<Notice> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/notices/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create notice');
    }
    return response.json();
  }
};
