import { API_CONFIG } from '@/lib/api-config';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  role: 'admin' | 'resident' | 'guard' | 'super_admin' | 'family_member';
  is_active: boolean;
  is_password_changed: boolean;
  created_at: string;
  house_address?: string;
  mfa_enabled?: boolean;
  profile_picture?: string;
  profile_picture_url?: string;
}

export interface LoginResponse {
  access_token?: string;
  token_type?: string;
  mfa_required?: boolean;
  temp_token?: string;
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

  async mfaLogin(tempToken: string, code: string): Promise<LoginResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/mfa/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ temp_token: tempToken, token: code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'MFA Login failed');
    }

    return response.json();
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<User> {
    const token = this.getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to change password');
    }

    return response.json();
  },

  async resetPassword(userId: number, newPassword: string): Promise<User> {
    const token = this.getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userId}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ new_password: newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to reset password');
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
    // Redirect logic should be handled by the application/context
    if (typeof window !== 'undefined') {
       window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }
};
