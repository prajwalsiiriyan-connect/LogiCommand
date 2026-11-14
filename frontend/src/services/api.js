import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lc_token');
      localStorage.removeItem('lc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ── Dashboard ────────────────────────────────
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
};

// ── Shipments ────────────────────────────────
export const shipmentAPI = {
  getAll:   (params) => api.get('/shipments', { params }),
  getOne:   (id)     => api.get(`/shipments/${id}`),
  create:   (data)   => api.post('/shipments', data),
  update:   (id, d)  => api.put(`/shipments/${id}`, d),
  remove:   (id)     => api.delete(`/shipments/${id}`),
  getStats: ()       => api.get('/shipments/stats'),
};

// ── Inventory ────────────────────────────────
export const inventoryAPI = {
  getAll:   (params) => api.get('/inventory', { params }),
  getOne:   (id)     => api.get(`/inventory/${id}`),
  create:   (data)   => api.post('/inventory', data),
  update:   (id, d)  => api.put(`/inventory/${id}`, d),
  remove:   (id)     => api.delete(`/inventory/${id}`),
  getStats: ()       => api.get('/inventory/stats'),
};

// ── Orders ───────────────────────────────────
export const orderAPI = {
  getAll:   (params) => api.get('/orders', { params }),
  getOne:   (id)     => api.get(`/orders/${id}`),
  create:   (data)   => api.post('/orders', data),
  update:   (id, d)  => api.put(`/orders/${id}`, d),
  remove:   (id)     => api.delete(`/orders/${id}`),
  getStats: ()       => api.get('/orders/stats'),
};

// ── Suppliers ────────────────────────────────
export const supplierAPI = {
  getAll:   (params) => api.get('/suppliers', { params }),
  getOne:   (id)     => api.get(`/suppliers/${id}`),
  create:   (data)   => api.post('/suppliers', data),
  update:   (id, d)  => api.put(`/suppliers/${id}`, d),
  remove:   (id)     => api.delete(`/suppliers/${id}`),
  getStats: ()       => api.get('/suppliers/stats'),
};

// ── Routes ───────────────────────────────────
export const routeAPI = {
  getAll:            (params) => api.get('/routes', { params }),
  getOne:            (id)     => api.get(`/routes/${id}`),
  create:            (data)   => api.post('/routes', data),
  update:            (id, d)  => api.put(`/routes/${id}`, d),
  remove:            (id)     => api.delete(`/routes/${id}`),
  getRecommendations:(params) => api.get('/routes/recommendations', { params }),
};

// ── Alerts ───────────────────────────────────
export const alertAPI = {
  getAll:   (params) => api.get('/alerts', { params }),
  getOne:   (id)     => api.get(`/alerts/${id}`),
  create:   (data)   => api.post('/alerts', data),
  update:   (id, d)  => api.put(`/alerts/${id}`, d),
  remove:   (id)     => api.delete(`/alerts/${id}`),
  getStats: ()       => api.get('/alerts/stats'),
};

export default api;
