import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SELECTED_TENANT: 'gated_community_selected_tenant',
  AUTH_TOKEN: 'gated_community_auth_token',
  USER_PROFILE: 'gated_community_user_profile',
};

export const Storage = {
  // Generic
  getItem: async (key: string) => {
      try {
          return await AsyncStorage.getItem(key);
      } catch (e) {
          console.error('Failed to get item', e);
          return null;
      }
  },

  setItem: async (key: string, value: string) => {
      try {
          await AsyncStorage.setItem(key, value);
      } catch (e) {
          console.error('Failed to set item', e);
      }
  },

  // User Profile
  saveUser: async (user: any) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user', e);
    }
  },

  getUser: async () => {
    try {
      const user = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Failed to get user', e);
      return null;
    }
  },

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
