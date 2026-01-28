import { Platform } from 'react-native';
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

  // Fix localhost for Android Emulator
  if (Platform.OS === 'android') {
    finalUrl = finalUrl
      .replace('http://localhost', 'http://10.0.2.2')
      .replace('http://127.0.0.1', 'http://10.0.2.2');
  }
  
  return finalUrl;
};
