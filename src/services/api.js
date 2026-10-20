/**
 * API Configuration
 * Dice & Deck Tabletop Shop
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/tabletop-shop/backend/public/api';
const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'mock';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Get headers for API requests
 */
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    let errorMsg = data.error || data.message || 'Request failed';
    if (data.errors && typeof data.errors === 'object') {
      const errorList = Object.values(data.errors).join(', ');
      if (errorList) {
        errorMsg = `${errorMsg}: ${errorList}`;
      }
    }
    const err = new Error(errorMsg);
    err.data = data;
    throw err;
  }

  if (Array.isArray(data.data)) {
    const list = data.data;
    if (data.pagination !== undefined) list.pagination = data.pagination;
    if (data.counts !== undefined) list.counts = data.counts;
    list.data = data.data;
    return list;
  }

  return data.data !== undefined ? data.data : data;
};

/**
 * API request wrapper
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      ...getHeaders(options.auth !== false),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Upload file to server
 */
const uploadFile = async (file, category = 'products') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  const token = getAuthToken();
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  return await handleResponse(response);
};

/**
 * API methods
 */
export const api = {
  // Auth endpoints
  auth: {
    register: (data) => apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    }),

    login: (data) => apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    }),

    logout: () => apiRequest('/auth/logout', {
      method: 'POST',
    }),

    getMe: () => apiRequest('/auth/me'),

    updateProfile: (data) => apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },

  // Products endpoints
  products: {
    getAll: (params = {}) => {
      const cleanParams = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          cleanParams[k] = v;
        }
      });
      const query = new URLSearchParams(cleanParams).toString();
      return apiRequest(`/products${query ? `?${query}` : ''}`, { auth: false });
    },

    getById: (id) => apiRequest(`/products/${id}`, { auth: false }),

    create: (data) => apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    update: (id, data) => apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    delete: (id) => apiRequest(`/products/${id}`, {
      method: 'DELETE',
    }),
  },

  // Orders endpoints
  orders: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/orders${query ? `?${query}` : ''}`);
    },

    getById: (id) => apiRequest(`/orders/${id}`),

    create: (data) => apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    }),

    update: (id, data) => apiRequest(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    updateStatus: (id, status) => apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

    delete: (id) => apiRequest(`/orders/${id}`, {
      method: 'DELETE',
    }),
  },

  // Favorites endpoints
  favorites: {
    getAll: () => apiRequest('/favorites'),

    toggle: (gameId) => apiRequest('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    }),

    clear: () => apiRequest('/favorites', {
      method: 'DELETE',
    }),
  },

  // Reviews endpoints
  reviews: {
    getByProduct: (productId) => apiRequest(`/products/${productId}/reviews`, { auth: false }),

    create: (productId, data) => apiRequest(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    getAll: (params = {}) => {
      const cleanParams = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          cleanParams[k] = v;
        }
      });
      const query = new URLSearchParams(cleanParams).toString();
      return apiRequest(`/reviews${query ? `?${query}` : ''}`);
    },

    updateStatus: (id, status) => apiRequest(`/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

    delete: (id) => apiRequest(`/reviews/${id}`, {
      method: 'DELETE',
    }),
  },

  // Admin endpoints
  admin: {
    getUsers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/users${query ? `?${query}` : ''}`);
    },

    updateUserRole: (userId, role) => apiRequest(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

    getAnalytics: () => apiRequest('/admin/analytics'),

    getTelegramSettings: () => apiRequest('/admin/telegram'),

    saveTelegramSettings: (data) => apiRequest('/admin/telegram', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    testTelegram: (data = {}) => apiRequest('/admin/telegram/test', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // File upload
  upload: uploadFile,
};

export { API_BASE_URL, DATA_SOURCE, getAuthToken };
export default api;
