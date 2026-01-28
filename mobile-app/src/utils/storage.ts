import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SELECTED_TENANT: 'gated_community_selected_tenant',
  AUTH_TOKEN: 'gated_community_auth_token',
};

export const Storage = {
  // Tenant Persistence
  saveTenant: async (tenant: any) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_TENANT, JSON.stringify(tenant));
    } catch (e) {
      console.error('Failed to save tenant', e);
    }
  },

  getTenant: async () => {
    try {
      const tenant = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_TENANT);
      return tenant ? JSON.parse(tenant) : null;
    } catch (e) {
      console.error('Failed to get tenant', e);
      return null;
    }
  },

  clearTenant: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_TENANT);
    } catch (e) {
      console.error('Failed to clear tenant', e);
    }
  },

  // Auth Persistence
  saveToken: async (token: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (e) {
      console.error('Failed to save token', e);
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (e) {
      console.error('Failed to get token', e);
      return null;
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (e) {
      console.error('Failed to remove token', e);
    }
  },

  // Clear All (for debugging or full reset)
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Failed to clear all storage', e);
    }
  },
};
