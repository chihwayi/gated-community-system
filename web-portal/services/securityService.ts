import { API_CONFIG } from '@/lib/api-config';
import { authService } from './authService';

export interface BlacklistEntry {
  id: number;
  name: string;
  phone_number?: string;
  id_number?: string;
  reason?: string;
  created_at: string;
}

export interface BlacklistCreate {
  name: string;
  phone_number?: string;
  id_number?: string;
  reason?: string;
}

export interface PatrolLog {
  id: number;
  guard_id: number;
  timestamp: string;
  latitude: number;
  longitude: number;
  notes?: string;
}

export const securityService = {
  // Blacklist
  async getBlacklist(): Promise<BlacklistEntry[]> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/security/blacklist`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch blacklist');
    return response.json();
  },

  async addToBlacklist(data: BlacklistCreate): Promise<BlacklistEntry> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/security/blacklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add to blacklist');
    return response.json();
  },

  async removeFromBlacklist(id: number): Promise<void> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/security/blacklist/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to remove from blacklist');
  },

  // Patrol Logs
  async getPatrolLogs(limit: number = 50): Promise<PatrolLog[]> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/security/patrol-logs?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch patrol logs');
    return response.json();
  },

  async createPatrolLog(latitude: number, longitude: number, notes?: string): Promise<PatrolLog> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/security/patrol-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ latitude, longitude, notes }),
    });
    if (!response.ok) throw new Error('Failed to create patrol log');
    return response.json();
  }
};
