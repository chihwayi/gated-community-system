import { API_CONFIG } from '@/lib/api-config';

const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async <T>(response: Response): Promise<{ data: T }> => {
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // Only redirect if not already on login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'API request failed');
  }
  const data = await response.json();
  return { data };
};

const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const api = {
  get: async <T>(url: string) => {
    const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}${url}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },
  post: async <T>(url: string, body: any, customHeaders: HeadersInit = {}) => {
    const headers = getHeaders() as Record<string, string>;
    let bodyData = body;

    if (body instanceof FormData) {
      delete headers['Content-Type'];
    } else {
      bodyData = JSON.stringify(body);
    }

    const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}${url}`, {
      method: 'POST',
      headers: { ...headers, ...customHeaders },
      body: bodyData,
    });
    return handleResponse<T>(response);
  },
  patch: async <T>(url: string, body: any) => {
    const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}${url}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },
  put: async <T>(url: string, body: any) => {
    const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}${url}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },
  delete: async <T>(url: string) => {
    const response = await fetchWithTimeout(`${API_CONFIG.BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },
};

export default api;
