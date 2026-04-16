import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const auth = {
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  user: () => api.get('/user'),
};

export const workstreams = {
  list: () => api.get('/workstreams'),
  get: (id) => api.get(`/workstreams/${id}`),
  create: (data) => api.post('/workstreams', data),
  update: (id, data) => api.put(`/workstreams/${id}`, data),
  delete: (id) => api.delete(`/workstreams/${id}`),
  initiatives: (id) => api.get(`/workstreams/${id}/initiatives`),
};

export const initiatives = {
  list: (params) => api.get('/initiatives', { params }),
  get: (id) => api.get(`/initiatives/${id}`),
  create: (data) => api.post('/initiatives', data),
  update: (id, data) => api.put(`/initiatives/${id}`, data),
  delete: (id) => api.delete(`/initiatives/${id}`),
};

export const transformationItems = {
  list: (params) => api.get('/transformation-items', { params }),
  get: (id) => api.get(`/transformation-items/${id}`),
  create: (data) => api.post('/transformation-items', data),
  update: (id, data) => api.put(`/transformation-items/${id}`, data),
  updateStatus: (id, data) => api.patch(`/transformation-items/${id}/status`, data),
  delete: (id) => api.delete(`/transformation-items/${id}`),
};

export const dependencies = {
  list: (params) => api.get('/dependencies', { params }),
  get: (id) => api.get(`/dependencies/${id}`),
  create: (data) => api.post('/dependencies', data),
  update: (id, data) => api.put(`/dependencies/${id}`, data),
  delete: (id) => api.delete(`/dependencies/${id}`),
  nextId: () => api.get('/dependencies-next-id'),
};

export const actions = {
  list: (params) => api.get('/actions', { params }),
  get: (id) => api.get(`/actions/${id}`),
  create: (data) => api.post('/actions', data),
  update: (id, data) => api.put(`/actions/${id}`, data),
  delete: (id) => api.delete(`/actions/${id}`),
  nextId: () => api.get('/actions-next-id'),
};

export const ktSessions = {
  list: (params) => api.get('/kt-sessions', { params }),
  get: (id) => api.get(`/kt-sessions/${id}`),
  create: (data) => api.post('/kt-sessions', data),
  update: (id, data) => api.put(`/kt-sessions/${id}`, data),
  delete: (id) => api.delete(`/kt-sessions/${id}`),
};

export const dashboard = {
  get: () => api.get('/dashboard'),
};

export const exportData = {
  download: (type) =>
    api.get(`/export/${type}`, { responseType: 'blob' }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }),
};

export default api;
