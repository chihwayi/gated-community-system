import { API_CONFIG } from '@/lib/api-config';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'resident' | 'guard';
  is_active: boolean;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_CONFIG.BASE_URL}/login/access-token`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    return response.json();
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  removeToken() {
    localStorage.removeItem('token');
  },

  logout() {
    this.removeToken();
    window.location.href = '/login';
  }
};
