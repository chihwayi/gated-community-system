import { API_CONFIG } from '@/lib/api-config';
import { authService } from './authService';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  role: 'admin' | 'resident' | 'guard' | 'family_member';
  is_active: boolean;
  created_at: string;
  house_address?: string;
  profile_picture?: string;
  profile_picture_url?: string;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  house_address?: string;
  role: 'admin' | 'resident' | 'guard' | 'family_member';
}

export interface UserUpdate {
  full_name?: string;
  phone_number?: string;
  house_address?: string;
  email?: string;
  is_active?: boolean;
  profile_picture?: string;
}

export const userService = {
  async getResidents(): Promise<User[]> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    // Fetch all users and filter client-side to include residents and family members
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/?limit=1000`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch residents');
    }
    const users: User[] = await response.json();
    return users.filter(u => u.role === 'resident' || u.role === 'family_member');
  },

  async getGuards(): Promise<User[]> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/users/?role=guard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch guards');
    }
    return response.json();
  },

  async getHouseholdMembers(): Promise<User[]> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/users/household`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch household members');
    }
    return response.json();
  },

  async getUser(id: number): Promise<User> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  async createUser(user: UserCreate): Promise<User> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create user');
    }
    return response.json();
  },

  async updateUser(userId: number, userData: UserUpdate): Promise<User> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update user');
    }
    return response.json();
  }
};
