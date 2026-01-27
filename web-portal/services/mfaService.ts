import { API_CONFIG } from '@/lib/api-config';
import { authService } from './authService';

export interface MFASetupResponse {
  secret: string;
  otpauth_url: string;
}

export const mfaService = {
  async setupMFA(): Promise<MFASetupResponse> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/mfa/setup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to setup MFA');
    }
    return response.json();
  },

  async verifySetup(code: string): Promise<void> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/mfa/verify-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token: code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to verify MFA setup');
    }
  },

  async disableMFA(code: string): Promise<void> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_CONFIG.BASE_URL}/mfa/disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token: code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to disable MFA');
    }
  }
};
