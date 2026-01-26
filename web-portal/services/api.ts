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
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'API request failed');
  }
  const data = await response.json();
  return { data };
};

const api = {
  get: async <T>(url: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
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

    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
      method: 'POST',
      headers: { ...headers, ...customHeaders },
      body: bodyData,
    });
    return handleResponse<T>(response);
  },
  patch: async <T>(url: string, body: any) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },
  put: async <T>(url: string, body: any) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },
  delete: async <T>(url: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },
};

export default api;
