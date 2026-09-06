import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export const analyzeApi = {
  submit: (data: { report_text: string; report_type: string }) =>
    api.post('/api/v1/analyze', data),
};

export const reportsApi = {
  list: (params?: { risk_level?: string; limit?: number; offset?: number }) =>
    api.get('/api/v1/reports', { params }),
  get: (id: number) => api.get(`/api/v1/reports/${id}`),
  delete: (id: number) => api.delete(`/api/v1/reports/${id}`),
};

export const analyticsApi = {
  overview: () => api.get('/api/v1/analytics/overview'),
  trends: () => api.get('/api/v1/analytics/trends'),
  heatmap: () => api.get('/api/v1/analytics/heatmap'),
};

export const alertsApi = {
  list: (params?: { status?: string; risk_level?: string }) =>
    api.get('/api/v1/alerts', { params }),
  acknowledge: (id: number) => api.post(`/api/v1/alerts/${id}/acknowledge`),
  resolve: (id: number, notes?: string) =>
    api.post(`/api/v1/alerts/${id}/resolve`, { notes }),
  dismiss: (id: number) => api.delete(`/api/v1/alerts/${id}`),
};

export const modelApi = {
  info: () => api.get('/api/v1/model/info'),
};

export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
