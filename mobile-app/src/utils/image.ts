import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { API_URL } from '../config/api';

export const getImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  
  let finalUrl = url;

  if (!url.startsWith('http')) {
    // Remove /api/v1 from API_URL to get base host
    // API_URL usually looks like http://10.0.2.2:8000/api/v1
    const baseUrl = API_URL.replace(/\/api\/v1\/?$/, '');
    
    // Ensure url starts with / if not present (though usually it does)
    const path = url.startsWith('/') ? url : `/${url}`;
    
    finalUrl = `${baseUrl}${path}`;
  }

  // Fix localhost/127.0.0.1 for Android
  if (Platform.OS === 'android') {
    try {
      const apiHost = new URL(API_URL).hostname;
      const u = new URL(finalUrl);
      const isLocalHost = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
      if (isLocalHost) {
        if (Device.isDevice) {
          // Physical device: rewrite to API_URL host (LAN IP)
          u.hostname = apiHost;
          finalUrl = u.toString();
        } else {
          // Emulator: use 10.0.2.2
          u.hostname = '10.0.2.2';
          finalUrl = u.toString();
        }
      }
    } catch {
      // Fallback simple replacement
      const replacement = Device.isDevice ? API_URL.replace(/^https?:\/\//, '').split('/')[0] : '10.0.2.2';
      finalUrl = finalUrl
        .replace('http://localhost', `http://${replacement}`)
        .replace('http://127.0.0.1', `http://${replacement}`);
    }
  }
  
  return finalUrl;
};
