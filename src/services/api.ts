import axios from 'axios';

const api = axios.create({
  baseURL:
    (process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.32:3000') + '/api',
  timeout: 30000,
  headers: {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
});

console.log('BASE URL:', api.defaults.baseURL);

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  console.log(' Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    hasFile: config.data instanceof FormData,
  });

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(' Response:', response.status);
    return response;
  },
  (error) => {
    console.error(' Error Response:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

export default api;
