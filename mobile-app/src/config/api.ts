import { Platform } from 'react-native';

// Resolve a single backend URL from env, shared with web-portal
// Prefer NEXT_PUBLIC_API_URL (web), fallback to EXPO_PUBLIC_API_URL (mobile)
// Rewrite localhost for Android emulator automatically
const getBaseUrl = () => {
  const raw =
    (process.env.NEXT_PUBLIC_API_URL as string | undefined) ||
    (process.env.EXPO_PUBLIC_API_URL as string | undefined);
  
  if (!raw) {
    throw new Error('API base URL not set. Define NEXT_PUBLIC_API_URL (and/or EXPO_PUBLIC_API_URL).');
  }
  
  let url = raw;
  if (Platform.OS === 'android') {
    url = url
      .replace('http://localhost', 'http://10.0.2.2')
      .replace('http://127.0.0.1', 'http://10.0.2.2');
  }
  return url;
};

export const API_URL = getBaseUrl();

export const ENDPOINTS = {
  TENANTS: '/tenants/public',
  LOGIN: '/login/access-token',
  RESIDENT_PROFILE: '/users/me',
  MY_VISITORS: '/visitors/me',
  POLLS: '/polls/',
  NOTICES: '/notices/',
  STAFF: '/staff/',
  SOS: '/incidents/sos',
  INCIDENTS: '/incidents/',
  USERS: '/users/',
  VEHICLES: '/vehicles/',
  PARCELS: '/parcels/',
  VISITORS: '/visitors/',
  AMENITIES: '/amenities/',
  BOOKINGS: '/bookings/',
  DOCUMENTS: '/documents/',
  MARKETPLACE: '/marketplace/',
  TICKETS: '/tickets/',
  STATS: '/stats/',
  PACKAGES: '/packages/',
  NOTIFICATIONS: '/notifications/',
  FINANCIAL: '/financial/',
  HOUSEHOLD: '/users/household',
};
