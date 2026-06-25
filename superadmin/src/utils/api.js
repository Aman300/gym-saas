const API_BASE = import.meta.env.PROD
  ? 'https://gymapi.chakanroad.fun/api'
  : 'http://localhost:5050/api';

const getHeaders = () => {
  const token = localStorage.getItem('gym-superadmin-token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('gym-superadmin-token');
      localStorage.removeItem('gym-superadmin-user');
      window.location.href = '/login';
    }
    return await res.json();
  },

  post: async (endpoint, body) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('gym-superadmin-token');
      localStorage.removeItem('gym-superadmin-user');
      window.location.href = '/login';
    }
    return await res.json();
  },

  put: async (endpoint, body) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('gym-superadmin-token');
      localStorage.removeItem('gym-superadmin-user');
      window.location.href = '/login';
    }
    return await res.json();
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('gym-superadmin-token');
      localStorage.removeItem('gym-superadmin-user');
      window.location.href = '/login';
    }
    return await res.json();
  },
};
