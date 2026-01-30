export const API_CONFIG = {
  // Use environment variable if available, otherwise default to local backend
  // In development, .env.local sets this to http://localhost:8000/api/v1
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 10000,
};

export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_CONFIG.BASE_URL}/${cleanPath}`;
};
