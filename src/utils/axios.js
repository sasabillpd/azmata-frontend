import axios from 'axios';

const api = axios.create({
  baseURL: 'https://azmata-backend-production.up.railway.app/api',
});

// Auto attach token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Endpoint yang boleh 401 tanpa trigger logout
const OPTIONAL_AUTH_ENDPOINTS = [
  '/wishlist/',
  '/reviews/check/',
];

const isOptionalEndpoint = (url = '') =>
  OPTIONAL_AUTH_ENDPOINTS.some((path) => url.includes(path));

// Handle 401 otomatis logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';

      if (!isOptionalEndpoint(url)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;